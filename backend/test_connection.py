import pyodbc

# Teste de conexão ao SQL Server
server = 'localhost'
port = '1433'
username = 'sa'
password = 'Atec123!'
database = 'master'  # Primeiro conectar ao master

try:
    # Tentar conexão ao banco master
    conn_str = f'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server},{port};DATABASE={database};UID={username};PWD={password}'
    conn = pyodbc.connect(conn_str)
    print("✅ Conexão ao SQL Server bem-sucedida!")
    
    cursor = conn.cursor()
    
    # Listar todos os bancos de dados disponíveis
    cursor.execute("SELECT name FROM sys.databases")
    databases = cursor.fetchall()
    print("\nBancos de dados disponíveis:")
    for db in databases:
        print(f"  - {db[0]}")
    
    # Verificar se nome_db existe
    cursor.execute("SELECT name FROM sys.databases WHERE name = 'nome_db'")
    result = cursor.fetchone()
    
    if result:
        print("\n✅ Banco de dados 'nome_db' existe!")
    else:
        print("\n❌ Banco de dados 'nome_db' NÃO existe!")
        print("\nPara criar, execute:")
        print("CREATE DATABASE nome_db;")
    
    conn.close()
    
except pyodbc.Error as e:
    print(f"❌ Erro ao conectar ao SQL Server:")
    print(f"   {e}")
    print("\nVerifique:")
    print("  1. SQL Server está rodando?")
    print("  2. Usuário 'sa' e senha 'Atec123!' estão corretos?")
    print("  3. SQL Server está configurado para aceitar conexões TCP/IP na porta 1433?")
