"""
Script de teste para os endpoints de agendamentos
"""

import asyncio
import httpx
from datetime import date, time, datetime
import json


BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api/v1"


async def testar_endpoints():
    """Testar todos os endpoints de agendamentos"""
    
    print("🧪 Iniciando testes dos endpoints de agendamentos...\n")
    
    async with httpx.AsyncClient() as client:
        
        # 1. Testar criação de agendamento
        print("1️⃣  Testando criação de agendamento...")
        agendamento_data = {
            "nome_cliente": "João Silva",
            "contacto": "912345678",
            "email": "joao@email.com",
            "servicos": ["Mudança de óleo", "Inspeção"],
            "data_agendamento": "2024-02-15",
            "hora_inicio": "09:00",
            "hora_fim": "11:00",
            "observacoes": "Cliente preferencial",
            "status": "pendente"
        }
        
        try:
            response = await client.post(
                f"{API_URL}/agendamentos/",
                json=agendamento_data,
                timeout=10.0
            )
            print(f"   Status: {response.status_code}")
            if response.status_code == 201:
                agendamento_criado = response.json()
                agendamento_id = agendamento_criado["id"]
                print(f"   ✅ Agendamento criado com ID: {agendamento_id}")
                print(f"   Cliente: {agendamento_criado['nome_cliente']}")
            else:
                print(f"   ❌ Erro: {response.text}")
                return False
        except Exception as e:
            print(f"   ❌ Erro na requisição: {e}")
            return False
        
        # 2. Testar listagem de agendamentos
        print("\n2️⃣  Testando listagem de agendamentos...")
        try:
            response = await client.get(f"{API_URL}/agendamentos/", timeout=10.0)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                lista = response.json()
                print(f"   ✅ Total de agendamentos: {lista['total']}")
                print(f"   Página: {lista['pagina']}, Por página: {lista['por_pagina']}")
            else:
                print(f"   ❌ Erro: {response.text}")
        except Exception as e:
            print(f"   ❌ Erro na requisição: {e}")
        
        # 3. Testar obtenção de agendamento específico
        print("\n3️⃣  Testando obtenção de agendamento específico...")
        try:
            response = await client.get(f"{API_URL}/agendamentos/{agendamento_id}", timeout=10.0)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                agendamento = response.json()
                print(f"   ✅ Agendamento obtido: {agendamento['nome_cliente']}")
                print(f"   Data: {agendamento['data_agendamento']}")
                print(f"   Status: {agendamento['status']}")
            else:
                print(f"   ❌ Erro: {response.text}")
        except Exception as e:
            print(f"   ❌ Erro na requisição: {e}")
        
        # 4. Testar atualização de status
        print("\n4️⃣  Testando atualização de status...")
        try:
            response = await client.patch(
                f"{API_URL}/agendamentos/{agendamento_id}/status?novo_status=confirmado",
                timeout=10.0
            )
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                agendamento_atualizado = response.json()
                print(f"   ✅ Status atualizado para: {agendamento_atualizado['status']}")
            else:
                print(f"   ❌ Erro: {response.text}")
        except Exception as e:
            print(f"   ❌ Erro na requisição: {e}")
        
        # 5. Testar verificação de conflito
        print("\n5️⃣  Testando verificação de conflito de horário...")
        conflito_data = {
            "data_agendamento": "2024-02-15",
            "hora_inicio": "09:30",
            "hora_fim": "10:30"
        }
        try:
            response = await client.post(
                f"{API_URL}/agendamentos/verificar-conflito",
                json=conflito_data,
                timeout=10.0
            )
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                resultado = response.json()
                print(f"   ✅ Conflito detectado: {resultado['conflito']}")
            else:
                print(f"   ❌ Erro: {response.text}")
        except Exception as e:
            print(f"   ❌ Erro na requisição: {e}")
        
        # 6. Testar estatísticas
        print("\n6️⃣  Testando estatísticas do dashboard...")
        try:
            response = await client.get(f"{API_URL}/agendamentos/dashboard/estatisticas", timeout=10.0)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                stats = response.json()
                print(f"   ✅ Agendamentos hoje: {stats['agendamentos_hoje']}")
                print(f"   Próximos 7 dias: {stats['proximos_7_dias']}")
                print(f"   Contadores por status: {stats['contadores_por_status']}")
            else:
                print(f"   ❌ Erro: {response.text}")
        except Exception as e:
            print(f"   ❌ Erro na requisição: {e}")
        
        # 7. Testar eliminação
        print("\n7️⃣  Testando eliminação de agendamento...")
        try:
            response = await client.delete(f"{API_URL}/agendamentos/{agendamento_id}", timeout=10.0)
            print(f"   Status: {response.status_code}")
            if response.status_code == 204:
                print(f"   ✅ Agendamento eliminado com sucesso")
            else:
                print(f"   ❌ Erro: {response.text}")
        except Exception as e:
            print(f"   ❌ Erro na requisição: {e}")
    
    print("\n✅ Testes concluídos!")
    return True


def testar_validacao_schemas():
    """Testar validação dos schemas Pydantic"""
    print("\n🔍 Testando validação dos schemas...")
    
    from app.schemas.agendamento import AgendamentoCreate, StatusAgendamento
    
    # Teste 1: Dados válidos
    print("   Teste 1: Dados válidos")
    try:
        agendamento = AgendamentoCreate(
            nome_cliente="Maria Santos",
            contacto="919876543",
            email="maria@email.com",
            servicos=["Revisão completa"],
            data_agendamento=date(2024, 3, 15),
            hora_inicio=time(14, 0),
            hora_fim=time(16, 0),
            observacoes="Primeira revisão"
        )
        print(f"   ✅ Schema válido: {agendamento.nome_cliente}")
    except Exception as e:
        print(f"   ❌ Erro de validação: {e}")
    
    # Teste 2: Email inválido
    print("   Teste 2: Email inválido")
    try:
        agendamento = AgendamentoCreate(
            nome_cliente="João",
            contacto="912345678",
            email="email_invalido",
            servicos=["Teste"],
            data_agendamento=date(2024, 3, 15),
            hora_inicio=time(14, 0),
            hora_fim=time(16, 0)
        )
        print(f"   ❌ Deveria ter falhado!")
    except Exception as e:
        print(f"   ✅ Validação funcionou: {e}")
    
    # Teste 3: Data no passado
    print("   Teste 3: Data no passado")
    try:
        agendamento = AgendamentoCreate(
            nome_cliente="Pedro",
            contacto="912345678",
            servicos=["Teste"],
            data_agendamento=date(2020, 1, 1),
            hora_inicio=time(14, 0),
            hora_fim=time(16, 0)
        )
        print(f"   ❌ Deveria ter falhado!")
    except Exception as e:
        print(f"   ✅ Validação funcionou: {e}")
    
    print("   ✅ Testes de validação concluídos!")


if __name__ == "__main__":
    print("🚀 Script de Teste - Sistema de Agendamentos")
    print("=" * 50)
    
    # Primeiro testar validação dos schemas
    testar_validacao_schemas()
    
    print("\n" + "=" * 50)
    print("⚠️  Para testar os endpoints, certifique-se de que:")
    print("   - O servidor está rodando em localhost:8000")
    print("   - A base de dados está configurada")
    print("   - Execute: uvicorn app.main:app --reload")
    print("\nPara executar os testes dos endpoints, descomente a linha abaixo:")
    print("# asyncio.run(testar_endpoints())")
    
    # Descomente a linha abaixo para executar os testes dos endpoints
    # asyncio.run(testar_endpoints())