import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import * as signalR from '@microsoft/signalr';

export const useChatAdminStore = defineStore('chatAdmin', () => {
  const activeGuests = ref({});
  const currentMemberId = ref(null);
  const isInitialized = ref(false);
  const connection = shallowRef(null);

  const initConnection = async (adminName) => {
    if (isInitialized.value) return;

    const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7197/api';
    const hubUrl = apiBase.replace(/\/api$/, '') + '/chatHub';

    try {
      const response = await fetch(`${apiBase}/ChatApi/GetChatMembers`);
      if (response.ok) {
        const apiResult = await response.json();
        // 配合組長規範：從 apiResult.data 迴圈抓取會員清單
        if (apiResult.success && apiResult.data) {
          apiResult.data.forEach(m => {
            activeGuests.value[m.memberId] = {
              memberId: m.memberId,
              realName: m.realName,
              messages: [],
              unreadCount: 0,
              hasLoadedHistory: false,
              isOnline: false
            };
          });
        }
      }
    } catch (err) {
      console.error("載入會員名單失敗:", err);
    }

    connection.value = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    connection.value.off("ReceiveFromMember"); 
    
    connection.value.on("ReceiveFromMember", (memberId, memberName, message) => {
      if (!activeGuests.value[memberId]) {
        activeGuests.value[memberId] = {
          memberId: memberId,
          realName: memberName,
          messages: [],
          unreadCount: 0,
          hasLoadedHistory: false,
          isOnline: true
        };
      } else {
        activeGuests.value[memberId].isOnline = true;
      }

      const now = new Date();
      const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      activeGuests.value[memberId].messages.push({ sender: 'Member', text: message, time: timeString });

      if (currentMemberId.value !== memberId) {
        activeGuests.value[memberId].unreadCount++;
      }
    });

    try {
      await connection.value.start();
      await connection.value.invoke("JoinAsAdmin");
      console.log(`員工客服 [${adminName}] 後台連線成功`);
      isInitialized.value = true;
    } catch (err) {
      console.error("連線失敗: ", err);
    }
  };

  const sendMessageToMember = async (adminName, message) => {
    if (!connection.value || !currentMemberId.value) return false;
    
    try {
      const memberIdInt = Number(currentMemberId.value);
      await connection.value.invoke("ReplyToMember", memberIdInt, adminName, message);
      
      const now = new Date();
      const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

      //  多加一個 realSenderName 屬性
      activeGuests.value[currentMemberId.value].messages.push({ sender: 'Admin',realSenderName: adminName, text: message, time: timeString });
      return true;
    } catch (err) {
      console.error("SignalR 發送失敗:", err);
      return false;
    }
  };

  return { activeGuests, currentMemberId, isInitialized, initConnection, sendMessageToMember };
});