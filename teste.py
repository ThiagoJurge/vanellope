import requests

# # Sua chave de API do Climatempo
API_KEY = "0e94329ecbdeca2f997f62c0dc9a5871"  # Substitua pelo seu token da API

# # Coordenadas de Konoha (Tokyo, JP)
# latitude = 35.6762   # Latitude de Tokyo
# longitude = 139.6503  # Longitude de Tokyo

# # URLs da API
# BASE_URL_CITY = "http://apiadvisor.climatempo.com.br/api/v1/locale/city"
# BASE_URL_WEATHER = "http://apiadvisor.climatempo.com.br/api/v1/weather/locale"

# # Função para obter o ID da cidade baseado nas coordenadas
# def obter_id_cidade(latitude, longitude):
#     try:
#         response = requests.get(BASE_URL_CITY, params={
#             'latitude': latitude,
#             'longitude': longitude,
#             'token': API_KEY
#         })

#         # Verificando a resposta
#         if response.status_code == 200:
#             data = response.json()
            
#             if 'id' in data:
#                 cidade_id = data['id']
#                 return cidade_id
#             else:
#                 print("Erro: ID da cidade não encontrado.")
#                 return None
#         else:
#             print(f"Erro ao acessar a API para obter ID da cidade: {response.status_code}")
#             return None
#     except Exception as e:
#         print(f"Erro ao acessar a API: {e}")
#         return None

# # Função para pegar o clima usando o ID da cidade
# def obter_clima_por_id(cidade_id):
#     try:
#         response = requests.get(f"http://apiadvisor.climatempo.com.br/api/v1/weather/locale/{cidade_id}/current", params={
#             'token': API_KEY
#         })
#         print(response.text)
#         # Verificando a resposta
#         if response.status_code == 200:
#             data = response.json()
#             print(data)
#             if data:
#                 clima = data['data']
#                 return {
#                     "temperatura": clima['temperature'],
#                     "umidade": clima['humidity'],
#                     "condicao": clima['condition'],
#                 }
#             else:
#                 print("Erro: Dados de clima não encontrados.")
#                 return None
#         else:
#             print(f"Erro ao acessar a API para obter clima: {response.status_code}")
#             return None
#     except Exception as e:
#         print(f"Erro ao acessar a API: {e}")
#         return None

# # Função para gerar o clima de Konoha
# def gerar_clima(vila, latitude, longitude):
#     cidade_id = obter_id_cidade(latitude, longitude)
#     if not cidade_id:
#         return f"– ❒❧ Clima: {vila} –\n  • Dados de clima não disponíveis.\n"
    
#     clima_real = obter_clima_por_id(cidade_id)
#     if not clima_real:
#         return f"– ❒❧ Clima: {vila} –\n  • Dados de clima não disponíveis.\n"
    
#     temperatura = clima_real["temperatura"]
#     umidade = clima_real["umidade"]
#     condicao = clima_real["condicao"]

#     return f"– ❒❧ Clima: {vila} –\n" + \
#            f"  • Temperatura: {temperatura}°C\n" + \
#            f"  • Umidade: {umidade}%\n" + \
#            f"  • Condição: {condicao}\n"

# # Exemplo de uso para Konoha
# vila = "Konoha"
# mensagem_clima = gerar_clima(vila, latitude, longitude)
# print(mensagem_clima)


response = requests.get(f"http://apiadvisor.climatempo.com.br/api-manager/user-token/{API_KEY}/radars")
print(response.text)