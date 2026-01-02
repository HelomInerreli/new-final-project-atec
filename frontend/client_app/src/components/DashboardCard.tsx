import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/DashboardCard.css";
import { Card } from "react-bootstrap";

/**
 * Interface para as propriedades do componente DashboardCard
 * Define os dados necessários para renderizar o cartão do dashboard
 */
interface DashboardCardProps {
  name: string;
  
}

/**
 * Componente para exibir um cartão no dashboard
 * Renderiza um Card Bootstrap com informações do perfil
 * @param name - Nome a ser exibido no cartão
 * @returns Componente JSX com cartão formatado
 */
const DashboardCard: React.FC<DashboardCardProps> = ({
  name,

}) => {
  return (
    <Card className="square-card">
      <Card.Body>
        
        <section className="profile">
          <h2>{name}</h2>
          
           
          
        </section>
      </Card.Body>
    </Card>
  );
};

export default DashboardCard;