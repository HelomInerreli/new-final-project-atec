import React from "react";


const Schedule: React.FC = () => {
return (
<div className="schedule">
<header className="schedule-header">
<div>
<h1>Meus Agendamentos</h1>
<p className="subtitle">Veja, crie e gere os seus agendamentos</p>
</div>
<div className="header-actions">
<button className="btn btn-primary">Novo Agendamento</button>

</div>
</header>
</div>
);
};

export default Schedule;
