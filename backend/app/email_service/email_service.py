import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
from dotenv import load_dotenv
load_dotenv()

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv('EMAIL_HOST')
        self.smtp_port = int(os.getenv('EMAIL_PORT', 587))
        self.email_user = os.getenv('EMAIL_HOST_USER')
        self.email_password = os.getenv('EMAIL_HOST_PASSWORD')
        self.email_from = os.getenv('EMAIL_FROM')
        
    def send_email(self, to_email: str, subject: str, body: str):
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"Mecatec Oficinas <{self.email_from}>"
            msg['To'] = to_email

            # Adicionar logo ao cabeçalho do email
            body_with_logo = f"""
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <div style="background-color: #dc2626; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🔧 MECATEC</h1>
                    <p style="color: white; margin: 5px 0 0 0; font-size: 14px;">Oficina Automóvel</p>
                </div>
                <div style="padding: 20px; background-color: #ffffff;">
                    {body}
                </div>
                <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                    <p style="margin: 5px 0;">Mecatec - Oficina Automóvel</p>
                    <p style="margin: 5px 0;">📍 Avenida Mário Brito (EN107), nº 3570 - Freixieiro, 4455-491 Perafita | 📞 +351 123 456 789</p>
                    <p style="margin: 5px 0;">✉️ geral@mecatec.pt</p>
                </div>
            </div>
            """

            msg.attach(MIMEText(body_with_logo, 'html'))
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.email_user, self.email_password)
                server.send_message(msg)
                
            print(f"Email enviado para {to_email} às {datetime.now()}")
            return True
        except Exception as e:
            print(f"Falha ao enviar email para {to_email}. Erro: {e}")
            return False
            
    def send_confirmation_email(self, customer_email: str, service_name: str, service_date: datetime):
        """Envia email de confirmação quando um appointment é criado"""
        subject = "Confirmação de Agendamento"
        
        html_content = f"""
        <html>
            <body>
                <h2>Confirmação de Agendamento</h2>
                <p>Caro Cliente,</p>
                <p>O seu agendamento para o serviço <strong>{service_name}</strong> foi confirmado.</p>
                <p><strong>Data e Hora:</strong> {service_date.strftime('%d/%m/%Y às %H:%M')}</p>
                <br>
                <p>Obrigado por escolher os nossos serviços!</p>
            </body>
        </html>
        """

        return self.send_email(customer_email, subject, html_content)
    
    def send_reminder_email(self, customer_email: str, service_name: str, service_date: datetime):
        """Envia email de lembrete 24h antes do appointment"""
        subject = "Lembrete de Agendamento"
        
        html_content = f"""
        <html>
            <body>
                <h2>Lembrete de Agendamento</h2>
                <p>Caro Cliente,</p>
                <p>Este é um lembrete para o seu próximo agendamento do serviço <strong>{service_name}</strong>.</p>
                <p><strong>Data e Hora:</strong> {service_date.strftime('%d/%m/%Y às %H:%M')}</p>
                <br>
                <p>Aguardamos a sua visita!</p>
            </body>
        </html>
        """

        return self.send_email(customer_email, subject, html_content)

    def send_extra_service_proposal_email(self, customer_email: str, customer_name: str, vehicle_plate: str, extra_service_name: str, price: float, description: str):
        """Envia email com proposta de serviço extra"""
        subject = f"Proposta de Serviço Extra - Veículo {vehicle_plate}"
        
        html_content = f"""
        <html>
            <body>
                <h2>Proposta de Serviço Adicional</h2>
                <p>Caro(a) {customer_name},</p>
                <p>Durante a inspeção do seu veículo ({vehicle_plate}), identificámos a necessidade de um serviço adicional:</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
                    <h3>{extra_service_name}</h3>
                    <p>{description}</p>
                    <p><strong>Valor Adicional:</strong> €{price:.2f}</p>
                </div>
                <p>Por favor, aceda à sua área de cliente para aprovar ou rejeitar este serviço.</p>
                <br>
                <p>Atenciosamente,</p>
                <p>A Equipa da Oficina</p>
            </body>
        </html>
        """
        
        return self.send_email(customer_email, subject, html_content)
        
    
    def send_extra_service_cancellation_email(self, customer_email: str, customer_name: str, vehicle_plate: str, extra_service_name: str):
        """Envia email quando um serviço extra proposto é cancelado"""
        subject = f"Serviço Extra Cancelado - Veículo {vehicle_plate}"
        
        html_content = f"""
        <html>
            <body>
                <h2>Serviço Extra Cancelado</h2>
                <p>Caro(a) {customer_name},</p>
                <p>Informamos que o serviço extra proposto para o seu veículo ({vehicle_plate}) foi cancelado:</p>
                <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <h3>{extra_service_name}</h3>
                    <p>Este serviço já não é necessário ou foi proposto por engano.</p>
                </div>
                <p>Não precisa de tomar nenhuma ação relativamente a este serviço.</p>
                <br>
                <p>Atenciosamente,</p>
                <p>A Equipa da Oficina</p>
            </body>
        </html>
        """
        
        return self.send_email(customer_email, subject, html_content)   
        
    
    def send_work_started_email(self, customer_email: str, customer_name: str, service_name: str, vehicle_plate: str):
        """Envia email quando o trabalho é iniciado"""
        subject = f"Trabalho Iniciado - {vehicle_plate}"
    
        html_content = f"""
        <html>
            <body>
                <h2>Trabalho Iniciado</h2>
                <p>Caro(a) {customer_name},</p>
                <p>Informamos que o trabalho no seu veículo <strong>{vehicle_plate}</strong> foi iniciado.</p>
                <p><strong>Serviço:</strong> {service_name}</p>
                <div style="background-color: #f0f8ff; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
                    <p>✓ A nossa equipa já está a trabalhar no seu veículo.</p>
                    <p>✓ Será notificado quando o trabalho for concluído.</p>
                </div>
                <br>
                <p>Atenciosamente,</p>
                <p>A Equipa da Oficina</p>
            </body>
        </html>
        """

        return self.send_email(customer_email, subject, html_content)

    def send_work_completed_email(self, customer_email: str, customer_name: str, service_name: str, vehicle_plate: str):
        """Envia email quando o trabalho é finalizado"""
        subject = f"Trabalho Concluído - {vehicle_plate}"
    
        html_content = f"""
        <html>
            <body>
                <h2>Trabalho Concluído</h2>
                <p>Caro(a) {customer_name},</p>
                <p>Temos o prazer de informar que o trabalho no seu veículo <strong>{vehicle_plate}</strong> foi concluído com sucesso!</p>
                <p><strong>Serviço:</strong> {service_name}</p>
                <div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0;">
                    <p>✓ O seu veículo está pronto para pagamento e consequente levantamento.</p>
                    <p>✓ Por favor, entre em contacto connosco para agendar o levantamento.</p>
                </div>
                <br>
                <p>Obrigado pela sua confiança!</p>
                <p>A Equipa da Oficina</p>
            </body>
        </html>
        """

        return self.send_email(customer_email, subject, html_content)

    def send_payment_confirmation_email(self, customer_email: str, customer_name: str, invoice_number: str, 
                                       amount: float, vehicle_plate: str):
        """Envia email de confirmação de pagamento"""
        subject = f"Pagamento Confirmado - Fatura {invoice_number}"
    
        html_content = f"""
        <html>
            <body>
                <h2>Pagamento Confirmado</h2>
                <p>Caro(a) {customer_name},</p>
                <p>Confirmamos o recebimento do seu pagamento!</p>
                
                <div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0;">
                    <p><strong>Fatura:</strong> {invoice_number}</p>
                    <p><strong>Veículo:</strong> {vehicle_plate}</p>
                    <p><strong>Valor Pago:</strong> &euro;{amount:.2f}</p>
                </div>
                
                <p>Pode consultar e descarregar a sua fatura a qualquer momento na área de cliente em <strong>Meus Serviços > Histórico</strong>.</p>
                <p>O seu veículo está pronto para levantamento.</p>
                
                <br>
                <p>Obrigado pela sua preferência!</p>
                <p>A Equipa da Oficina</p>
            </body>
        </html>
        """

        return self.send_email(customer_email, subject, html_content)