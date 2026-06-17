# 使用官方 .NET SDK 進行編譯
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# 複製專案檔並還原依賴項
COPY ["Shizuku.csproj", "./"]
RUN dotnet restore "./Shizuku.csproj"

# 複製其餘程式碼並進行發行 (Publish)
COPY . .
RUN dotnet publish "Shizuku.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 使用執行階段映像檔
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# 暴露 8080 連接埠 (.NET 8.0 之後容器預設的連接埠)
EXPOSE 8080

# 設定環境變數讓 .NET 接聽 8080 連接埠
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "Shizuku.dll"]
