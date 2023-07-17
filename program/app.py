import psycopg2
import csv

# Estabeleça a conexão com o banco de dados
conn = psycopg2.connect(dbname="easygestor", user="postgres", password="adminadmin", port="6543", host="192.168.1.40")
cursor = conn.cursor()

# Execute a consulta para recuperar todos os dados da tabela
cursor.execute("SELECT * FROM sellable")
results = cursor.fetchall()

# Nome do arquivo CSV a ser gerado
csv_file = 'arquivo.csv'

# Escreva os dados no arquivo CSV
with open(csv_file, 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    
    # Escreva os dados de cada linha
    for row in results:
        writer.writerow(row)

# Feche o cursor e a conexão com o banco de dados
cursor.close()
conn.close()

print("Os dados foram exportados para o arquivo CSV com sucesso.")
