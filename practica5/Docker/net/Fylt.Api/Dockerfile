# Base runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 7052

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copiamos los csproj de cada proyecto por separado para optimizar la cache
COPY ["Fylt.Api/Fylt.Api.csproj", "Fylt.Api/"]
COPY ["Fylt.Domain/Fylt.Domain.csproj", "Fylt.Domain/"]
COPY ["Fylt.Infrastructure/Fylt.Infrastructure.csproj", "Fylt.Infrastructure/"]

# Restauramos dependencias del API (esto arrastra el Domain)
RUN dotnet restore "Fylt.Api/Fylt.Api.csproj"

# Ahora copiamos el resto del código
COPY . .

# Compilamos
WORKDIR "/src/Fylt.Api"
RUN dotnet build "Fylt.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Publish stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "Fylt.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Final image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Fylt.Api.dll"]
