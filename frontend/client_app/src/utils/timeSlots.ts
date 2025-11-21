export const generateTimeSlots = (): string[] => {
    const timeSlots: string[] = [];
    for (let hour = 9; hour <= 17; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour < 17) {
            timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
    }
    return timeSlots;
};