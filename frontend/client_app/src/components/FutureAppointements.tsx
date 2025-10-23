import { useEffect, useState } from "react";
import { getServices } from "../services/ServiceHistoryServices";
import type { Appointment } from "../interfaces/appointment";
import "../i18n";
import { useTranslation } from "react-i18next";

export function FutureAppointments() {
const { t } = useTranslation();
const [appointments, setAppointments] = useState<Appointment[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
    const fetchAppointments = async () => {
    try {
        setLoading(true);
        const data = await getServices();
    
        
        const completedAppointments = data
            .filter((appointment: Appointment) => appointment.status?.id === )
            .sort((a: Appointment, b: Appointment) => a.id - b.id);
        
            setAppointments(completedAppointments);
            setError(null);
        } catch (err) {
            
            setError(t("errorLoadingServices"));
        } finally {
            setLoading(false);  
        }
    };

    fetchAppointments();
}, []);
}