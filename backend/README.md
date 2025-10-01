# Iniciar API

#### Entre na backend do projeto e execute os seguintes passos:

1. Criar a VENV - `python -m venv venv`
2. Ativando a VENV - `venv\Scripts\activate`
3. Importar as Bibliotecas - `pip install -r requirements.txt`
4. Executar a API com Uvicorn - `uvicorn app.main:app --reload`
   (Este é o comando recomendado, pois funciona corretamente com a estrutura de módulos do projeto.)

Para testar a API entre do Swager da API e teste seus endpoints.
`http://127.0.0.1:8000/docs/`

## Gerar/Atualizar o Ficheiro de Dependências

Sempre que instalar uma nova biblioteca (`pip install nome-da-biblioteca`), é uma boa prática atualizar o ficheiro `requirements.txt`.

Com a VENV ativa, execute:
`pip freeze > requirements.txt`

- Para desativar a VENV
  Desativando a VENV - `deactivate`

## Criar um novo "componente" de rota

1. Crie os ficheiros do componete nas pastas _[`app/crud`, `app/models`, `app/schemas` e `app/v1/routes`]_
   use como exemplo os ficheiros que lá já estão.

2. No ficheiro `app/api/v1/api.py` adicione o código abaixo(Trocando o nome do componente onde está NOME_DO_COMPONENTE):

```python
#Importe o componente de rota da pasta app/api/v1/routes/
from app.api.v1.routes import NOME_DO_COMPONENTE

#Adicione o código abaixo para adicionar o prefixo "/NOME_DO_COMPONENTE" na rota da api e direcionar para o componente de rota dele
api_router.include_router(customer.router, prefix="/NOME_DO_COMPONENTE", tags=["NOME_DO_COMPONENTE"])
```

Feito esses passos já deve ter uma nova rota com os endpoints adicionados. exemplo:
`http://127.0.0.1:8000/api/v1/NOME_DO_COMPONENTE/`
