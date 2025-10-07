import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/DashboardCard.css";
import { Card } from "react-bootstrap";


interface DashboardCardProps {
  name: string;
  
}

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