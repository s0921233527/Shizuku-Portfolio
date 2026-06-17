<script setup>
import { ref, onMounted } from 'vue'
import { productApi } from '@/api/Product.js'

const emit = defineEmits(['categorySelected'])
const menu = ref([])

onMounted(async () => {
    try {
        const res = await productApi.getDropdowns()
        const categories = res.data.data.categories ?? []
        const parentMap = {}

        categories.forEach(cat => {
            const parts      = cat.fFullName.split('-')
            const parentName = parts[0]
            const childName  = parts[1]

            if (!parentMap[parentName]) {
                parentMap[parentName] = {
                    title: parentName, open: false, children: []
                }
            }
            if (childName) {
                parentMap[parentName].children.push({
                    name:   childName,
                    fId:    cat.fId,      // ← 這裡改成 fId
                    parent: parentName
                })
            }
        })

        menu.value = Object.values(parentMap)
    } catch (err) {
        console.error('分類載入失敗', err)
    }
})

function toggle(item) { item.open = !item.open }

function selectCategory(child) {
    emit('categorySelected', child.fId, child.name, child.parent)
}
</script>

<template>
    <aside class="w-full font-serif">

        <button @click="$emit('categorySelected', null, null, null)"
                class="w-full text-left px-3 py-2 mb-2 text-xs font-semibold tracking-[0.25em] uppercase text-stone-400 hover:text-[#8E9A86] transition-colors">
            全部商品
        </button>

        <div class="border-t border-stone-200/60 pt-3">
            <ul class="space-y-1">
                <li v-for="item in menu" :key="item.title">

                    <button @click="toggle(item)"
                            class="w-full flex justify-between items-center px-3 py-2.5 text-sm font-medium tracking-[0.15em] text-stone-700 uppercase hover:text-[#8E9A86] transition-colors">
                        {{ item.title }}
                        <span class="text-[9px] text-stone-400 transition-transform duration-300"
                              :class="item.open ? 'rotate-90 text-[#8E9A86]' : ''">▸</span>
                    </button>

                    <ul v-show="item.open" class="mb-2 pl-3 border-l border-stone-100/80 ml-3 space-y-0.5">
                        <li v-for="child in item.children" :key="child.fId">
                             <a href="#"
                                @click.prevent="selectCategory(child)"
                                class="block px-3 py-1.5 text-xs tracking-wider text-stone-500 hover:text-[#8E9A86] hover:pl-5 transition-all duration-300">
                                 {{ child.name }}
                             </a>
                        </li>
                    </ul>

                </li>
            </ul>
        </div>

    </aside>
</template>