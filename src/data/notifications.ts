export type NotificationType = "course_update" | "new_class" | "transaction" | "system";

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    /** Where the notification points, when it points somewhere. */
    link?: string;
}

export const notifications: Notification[] = [
    {
        id: "ntf-1",
        type: "course_update",
        title: "Course Updated: Research Methods",
        message: "Module 3 content has been updated with new reading materials.",
        timestamp: "2 hours ago",
        isRead: false,
    },
    {
        id: "ntf-2",
        type: "new_class",
        title: "New Class Schedule Available",
        message: "Data Analysis & Reporting cohort 5 dates have been announced.",
        timestamp: "5 hours ago",
        isRead: false,
    },
    {
        id: "ntf-3",
        type: "transaction",
        title: "Payment Successful",
        message: "Your payment of ₦25,000 for Health & Safety Compliance has been confirmed.",
        timestamp: "1 day ago",
        isRead: true,
    },
    {
        id: "ntf-4",
        type: "system",
        title: "Scheduled Maintenance",
        message: "The platform will be undergoing maintenance on Saturday from 2 AM to 4 AM.",
        timestamp: "2 days ago",
        isRead: true,
    },
    {
        id: "ntf-5",
        type: "course_update",
        title: "Certificate Issued",
        message: "Congratulations! Your certificate for Leadership & Professional Dev is ready.",
        timestamp: "1 week ago",
        isRead: true,
    },
];
