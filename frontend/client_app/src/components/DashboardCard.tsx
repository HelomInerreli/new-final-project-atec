import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/DashboardCard.css";
import { Card } from "react-bootstrap";


const DashboardCard = () => (
  <Card className="square-card">
    <Card.Body>
      <Card.Title>Notable Scientists</Card.Title>
      <section className="profile">
        <h2>Maria Skłodowska-Curie</h2>
        <img
          className="avatar"
          alt="Maria Skłodowska-Curie"
          width={70}
          height={70}
        />
        <ul>
          <li>
            <b>Profession: </b> physicist and chemist
          </li>
          <li>
            <b>Awards: 4 </b> (Nobel Prize in Physics, Nobel Prize in Chemistry,
            Davy Medal, Matteucci Medal)
          </li>
          <li>
            <b>Discovered: </b> polonium (chemical element)
          </li>
        </ul>
      </section>
    </Card.Body>
  </Card>
);

export default DashboardCard;