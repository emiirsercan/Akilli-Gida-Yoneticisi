FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore as distinct layers
COPY ["src/FoodApp.API/FoodApp.API.csproj", "src/FoodApp.API/"]
COPY ["src/FoodApp.Application/FoodApp.Application.csproj", "src/FoodApp.Application/"]
COPY ["src/FoodApp.Domain/FoodApp.Domain.csproj", "src/FoodApp.Domain/"]
COPY ["src/FoodApp.Infrastructure/FoodApp.Infrastructure.csproj", "src/FoodApp.Infrastructure/"]
RUN dotnet restore "src/FoodApp.API/FoodApp.API.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/src/FoodApp.API"
RUN dotnet build "FoodApp.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FoodApp.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FoodApp.API.dll"]
