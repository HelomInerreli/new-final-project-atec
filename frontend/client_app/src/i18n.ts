import i18next from "i18next";
import { initReactI18next } from "react-i18next";

// Try to read the user's preferred language from localStorage so the selection
// persists across page navigation and reloads. Fall back to 'en' otherwise.
const storedLng = typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') : null;
const initialLng = storedLng || 'en';

i18next.use(initReactI18next).init({
  debug: true,
  lng: initialLng,
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        welcome: "Welcome",
        toMecatec: "to Mecatec",
        yourTrustedAutoShop: "Your trusted auto shop",
        technologyAndQuality: "Technology and quality at your service",
        preventiveMaintenance: "Preventive Maintenance",
        preventiveMaintenanceDescription:
          "Keep your vehicle in perfect condition.",
        quickDiagnosis: "Quick Diagnosis",
        quickDiagnosisDescription:
          "We identify problems with precision and speed.",
        specializedRepair: "Specialized Repairs",
        specializedRepairDescription:
          "Experienced technicians for any type of repair.",
        clientList: "Client List",
        serviceList: "Services",
        appointment: "Booking",
        about: "About",
        contact: "Contact",
        allRightsReserved: "All rights reserved",
        developedBy: "Developed by",
        carousel: {
          textImage1: "Professional Auto Shop",
          altImage1: "Auto shop with professional equipment",
          captionImage1: "Mecatec - Your Trusted Auto Shop",
          textImage2: "Organized Workshop",
          altImage2: "Well-organized auto repair shop",
          captionImage2: "Organization and Quality",
          textImage3: "Specialized Services",
          altImage3: "Mechanic working on a vehicle",
          captionImage3: "Specialized Services",
        },
        errorLoadingCustomers: "Error loading customers",
        customerList: "Customer List",
        customerManagementDescription:
          "Comprehensive management of Mecatec's customers",
        loading: "Loading",
        loadingCustomers: "Loading customers",
        registeredCustomers: "Registered Customers",
        name: "Name",
        email: "Email",
        phone: "Phone",
        address: "Address",
        age: "Age",
        years: "years",
        noCustomersFound: "No customers registered yet.",
        apiConnected: "API Connected!",
        customerDataFetchedSuccessfully: "If you see this list, the communication with the backend is working correctly.",
        login: "Login",
        logout: "Logout",
        register: "Register",
        username: "Username",
        password: "Password",
        confirmPassword: "Confirm Password",
        submit: "Submit",
        dashboard: "Dashboard",
        profile: "Profile",
        settings: "Settings",
      },
    },
    pt: {
      translation: {
        welcome: "Bem-vindo",
        toMecatec: "à Mecatec",
        yourTrustedAutoShop: "Sua oficina mecânica de confiança",
        technologyAndQuality: "Tecnologia e qualidade a seu serviço",
        preventiveMaintenance: "Manutenção Preventiva",
        preventiveMaintenanceDescription:
          "Mantenha seu veículo sempre em perfeito estado.",
        quickDiagnosis: "Diagnóstico Rápido",
        quickDiagnosisDescription:
          "Identificamos problemas com precisão e agilidade.",
        specializedRepair: "Reparos Especializados",
        specializedRepairDescription:
          "Técnicos experientes para qualquer tipo de reparo.",
        clientList: "Lista de Clientes",
        serviceList: "Serviços",
        appointment: "Agendamento",
        about: "Sobre",
        contact: "Contato",
        allRightsReserved: "Todos os direitos reservados",
        developedBy: "Desenvolvido por",
        carousel: {
          textImage1: "Oficina Mecânica Profissional",
          altImage1: "Oficina mecânica com equipamentos profissionais",
          captionImage1: "Mecatec - Sua Oficina de Confiança",
          textImage2: "Oficina Organizada",
          altImage2: "Oficina mecânica bem organizada",
          captionImage2: "Organização e Qualidade",
          textImage3: "Serviços Especializados",
          altImage3: "Mecânico trabalhando em veículo",
          captionImage3: "Serviços Especializados",
        },
        errorLoadingCustomers: "Erro ao carregar os clientes",
        customerList: "Lista de Clientes",
        customerManagementDescription:
          "Gestão completa dos clientes da Mecatec",
        loading: "Carregando",
        loadingCustomers: "Carregando clientes",
        registeredCustomers: "Clientes Cadastrados",
        name: "Nome",
        email: "Email",
        phone: "Telefone",
        address: "Endereço",
        age: "Idade",
        years: "anos",
        noCustomersFound: "Nenhum cliente cadastrado ainda.",
        apiConnected: "API Conectada!",
        customerDataFetchedSuccessfully: "Se estiver vendo esta lista, a comunicação com o backend está funcionando corretamente.",
        login: "Entrar",
        logout: "Sair",
        register: "Registrar",
        username: "Nome de usuário",
        password: "Senha",
        confirmPassword: "Confirmar Senha",
        submit: "Enviar",
        dashboard: "Painel",
        profile: "Perfil",
        settings: "Configurações",
      },
    },
  },
});




export default i18next;
