export interface EntryPass {
    id: string;
    eventTitle: string;
    date: string;
    time: string;
    venue: string;
    roomNumber: string;
    passCode: string;
    qrUrl: string;
    status: 'active' | 'past';
    /**
     * Course this pass admits the learner to. The pass is only released once
     * every entry-pass-gating assessment on that course has been passed.
     */
    courseId: string;
    /** The class session this pass admits the learner to, when it came from one. */
    sessionId?: string;
}

export const entryPasses: EntryPass[] = [
    {
        id: "pass-1",
        eventTitle: "Physical Security Workshop 2026",
        date: "March 15, 2026",
        time: "10:00 AM - 2:00 PM",
        venue: "ITeMS Building, University of Ibadan",
        roomNumber: "Lab 01 (Ground Floor)",
        passCode: "PSW-UI-2026-001",
        qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PSW-UI-2026-001",
        status: 'active',
        courseId: "1"
    },
    {
        id: "pass-2",
        eventTitle: "LMS Onboarding Session",
        date: "April 10, 2026",
        time: "9:00 AM - 11:30 AM",
        venue: "Virtual Room 4 (Google Meet)",
        roomNumber: "N/A (Virtual)",
        passCode: "LOS-VIRT-2026-045",
        qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LOS-VIRT-2026-045",
        status: 'active',
        courseId: "3"
    },
    {
        id: "pass-3",
        eventTitle: "Cybersecurity Hands-on Lab",
        date: "March 28, 2026",
        time: "1:00 PM - 6:00 PM",
        venue: "Tech Lab 3, ITeMS Building",
        roomNumber: "Level 2, Room 204",
        passCode: "CSL-UI-2026-112",
        qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CSL-UI-2026-112",
        status: 'active',
        courseId: "14"
    },
    {
        id: "pass-history-1",
        eventTitle: "Digital Literacy Induction",
        date: "Jan 12, 2026",
        time: "12:00 PM - 3:00 PM",
        venue: "Conference Hall, UI",
        roomNumber: "Main Auditorium",
        passCode: "DLI-UI-2026-001",
        qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DLI-UI-2026-001",
        status: 'past',
        courseId: "4"
    },
    {
        id: "pass-history-2",
        eventTitle: "Spatial Analysis Bootcamp",
        date: "Dec 05, 2025",
        time: "8:00 AM - 5:00 PM",
        venue: "Tech Lab 3, ITeMS Building",
        roomNumber: "Level 2, Room 204",
        passCode: "SAB-UI-2025-088",
        qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SAB-UI-2025-088",
        status: 'past',
        courseId: "5"
    }
];
