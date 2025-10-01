import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
from dotenv import load_dotenv
load_dotenv()

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.example.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.email_user = os.getenv('EMAIL_USER')
        self.email_password = os.getenv('EMAIL_PASSWORD')
        self.email_from = os.getenv('EMAIL_FROM')
        
    def send_email(self, to_email: str, subject: str, body: str):
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.email_from
            msg['To'] = to_email

            msg.attach(MIMEText(body, 'html'))
            
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