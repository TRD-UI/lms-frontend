import { Course, CourseMetadata, CourseModule, ModuleItem } from "./types";

const SAMPLE_VIDEO = "https://www.w3schools.com/html/mov_bbb.mp4";
const SAMPLE_PDF = "https://morth.nic.in/sites/default/files/dd12-13_0.pdf";

/** Instructor roster — ids match `adminUsers` in admin.ts. */
export const FUNKE = { id: "u-2", name: "Dr. Funke Akindele" };
export const SEUN = { id: "u-6", name: "Oluwaseun Fadare" };

export const courses: Course[] = [
    {
        id: "1",
        title: "Tech Odyssey",
        description: "Master web development, python, and graphics in this comprehensive digital journey.",
        duration: "3 months",
        location: "Training Lab 1, ITeMS Building, UI",
        seats: { enrolled: 18, total: 25 },
        category: "Software Development",
        fees: { type: 'flat', amount: 150000 },
        progress: 68,
        instructorId: FUNKE.id,
        instructorName: FUNKE.name,
        status: 'published',
        modules: [
            {
                id: "1-1",
                title: "Web Foundation (HTML/CSS/JS)",
                items: [
                    { id: "1-1-1", title: "Project Overview Video", type: 'video', url: SAMPLE_VIDEO },
                    { id: "1-1-2", title: "Tech Roadmap PDF", type: 'pdf', url: SAMPLE_PDF },
                    { id: "1-1-3", title: "Web Foundation Checkpoint", type: 'quiz', assessmentId: "as-2" }
                ]
            },
            {
                id: "1-2",
                title: "Styling & Layout Systems",
                items: [
                    { id: "1-2-1", title: "The CSS Box Model", type: 'video', url: SAMPLE_VIDEO },
                    { id: "1-2-2", title: "Flexbox & Grid Reference", type: 'pdf', url: SAMPLE_PDF },
                    { id: "1-2-3", title: "Responsive Patterns", type: 'document' }
                ]
            },
            {
                id: "1-3",
                title: "Programming with JavaScript & Python",
                items: [
                    { id: "1-3-1", title: "Variables, Types & Scope", type: 'video', url: SAMPLE_VIDEO },
                    { id: "1-3-2", title: "Functions & Control Flow", type: 'video', url: SAMPLE_VIDEO },
                    { id: "1-3-3", title: "Tech Odyssey Capstone", type: 'quiz', assessmentId: "as-3" }
                ]
            }
        ]
    },
    {
        id: "2",
        title: "Web Development",
        description: "HTML, CSS, Java script, and real-world projects.",
        duration: "3 months",
        location: "Training Lab 1, ITeMS Building, UI",
        seats: { enrolled: 12, total: 20 },
        category: "Software Development",
        fees: { type: 'flat', amount: 200000 },
        progress: 0,
        instructorId: SEUN.id,
        instructorName: SEUN.name,
        status: 'published',
        modules: [
            {
                id: "2-1",
                title: "Frontend Mastery",
                items: [
                    { id: "2-1-1", title: "Flexbox & Grid Video", type: 'video', url: SAMPLE_VIDEO }
                ]
            }
        ]
    },
    {
        id: "3",
        title: "Python Programming",
        description: "Language basics to real-world applications.",
        duration: "3 months",
        location: "Training Lab 1, ITeMS Building, UI",
        seats: { enrolled: 15, total: 20 },
        category: "Software Development",
        fees: { type: 'flat', amount: 150000 },
        progress: 12,
        instructorId: FUNKE.id,
        instructorName: FUNKE.name,
        status: 'published',
        modules: [
            {
                id: "3-1",
                title: "Python Basics",
                items: [
                    { id: "3-1-1", title: "Syntax Video", type: 'video', url: SAMPLE_VIDEO },
                    { id: "3-1-2", title: "Setting Up Your Environment", type: 'pdf', url: SAMPLE_PDF }
                ]
            },
            {
                id: "3-2",
                title: "Control Flow & Collections",
                items: [
                    { id: "3-2-1", title: "Loops & Conditionals", type: 'video', url: SAMPLE_VIDEO },
                    { id: "3-2-2", title: "Lists, Tuples & Dictionaries", type: 'video', url: SAMPLE_VIDEO },
                    { id: "3-2-3", title: "Control Flow Checkpoint", type: 'quiz', assessmentId: "as-7" }
                ]
            },
            {
                id: "3-3",
                title: "Certification",
                items: [
                    { id: "3-3-1", title: "Exam Preparation Guide", type: 'pdf', url: SAMPLE_PDF },
                    { id: "3-3-2", title: "Python Certification Exam", type: 'quiz', assessmentId: "as-8" }
                ]
            }
        ]
    },
    {
        id: "4",
        title: "Digital Literacy",
        description: "Basic Computer Operations, Online Security, Productivity Tools.",
        duration: "1 month",
        location: "Training Lab 1, ITeMS Building, UI",
        seats: { enrolled: 22, total: 30 },
        category: "Digital Literacy",
        instructorId: SEUN.id,
        instructorName: SEUN.name,
        status: 'published',
        fees: {
            type: 'tiered',
            tiers: [
                { name: "Cohort", amount: 50000 },
                { name: "Special", amount: 100000 }
            ]
        },
        modules: [
            {
                id: "4-1",
                title: "Digital Foundations",
                items: [
                    { id: "4-1-1", title: "OS Basics Video", type: 'video', url: SAMPLE_VIDEO },
                    { id: "4-1-2", title: "Productivity Tools Final", type: 'quiz', assessmentId: "as-10" }
                ]
            }
        ]
    },
    {
        id: "5",
        title: "ArcGIS & Spatial Analysis",
        description: "Mapping and spatial data analysis.",
        duration: "1 month",
        location: "ITeMS Building, UI",
        seats: { enrolled: 5, total: 10 },
        category: "Data Science",
        fees: { type: 'flat', amount: 50000 },
        instructorId: FUNKE.id,
        instructorName: FUNKE.name,
        status: 'published',
        modules: [
            { id: "5-1", title: "ArcGIS Intro", items: [{ id: "5-1-1", title: "Mapping Video", type: 'video', url: SAMPLE_VIDEO }] }
        ]
    },
    {
        id: "6",
        title: "Data Analysis / Data Analytics",
        description: "SPSS, Excel, Power BI for data insights.",
        duration: "5 weeks",
        location: "ITeMS Building, UI",
        seats: { enrolled: 10, total: 15 },
        category: "Data Science",
        instructorId: SEUN.id,
        instructorName: SEUN.name,
        status: 'published',
        fees: {
            type: 'tiered',
            tiers: [
                { name: "Cohort", amount: 80000 },
                { name: "Special", amount: 150000 }
            ]
        },
        modules: [
            { id: "6-1", title: "Data Tools", items: [{ id: "6-1-1", title: "Power BI Basics", type: 'video', url: SAMPLE_VIDEO }] }
        ]
    },
    {
        id: "7",
        title: "DATA PROCESSING",
        description: "Excel, Word, PowerPoint, SPSS mastery.",
        duration: "8 weeks",
        location: "ITeMS Building, UI",
        seats: { enrolled: 8, total: 15 },
        category: "Digital Literacy",
        fees: { type: 'flat', amount: 100000 },
        instructorId: SEUN.id,
        instructorName: SEUN.name,
        status: 'published',
        modules: [
            { id: "7-1", title: "Word & Excel", items: [{ id: "7-1-1", title: "Excel Formulas", type: 'video', url: SAMPLE_VIDEO }] }
        ]
    },
    {
        id: "8",
        title: "Digital Productivity Tools",
        description: "Online collaboration and office suite mastery.",
        duration: "1 month",
        location: "ITeMS Building, UI",
        seats: { enrolled: 12, total: 20 },
        category: "Digital Literacy",
        instructorId: SEUN.id,
        instructorName: SEUN.name,
        status: 'published',
        fees: {
            type: 'tiered',
            tiers: [
                { name: "Cohort", amount: 80000 },
                { name: "Special", amount: 150000 }
            ]
        },
        modules: [
            { id: "8-1", title: "Collaboration", items: [{ id: "8-1-1", title: "Teams & Zoom Video", type: 'video', url: SAMPLE_VIDEO }] }
        ]
    },
    {
        id: "9",
        title: "Generative AI",
        description: "Leveraging AI for creative and professional tasks.",
        duration: "1 month",
        location: "ITeMS Building, UI",
        seats: { enrolled: 15, total: 25 },
        category: "AI & ML",
        fees: { type: 'flat', amount: 100000 },
        instructorId: FUNKE.id,
        instructorName: FUNKE.name,
        status: 'published',
        modules: [
            { id: "9-1", title: "AI Basics", items: [{ id: "9-1-1", title: "Prompt Engineering", type: 'video', url: SAMPLE_VIDEO }] }
        ]
    },
    {
        id: "10",
        title: "Routing & Wireless Networking",
        description: "MikroTik OS and wireless network management.",
        duration: "2 weeks",
        location: "ITeMS Building, UI",
        seats: { enrolled: 6, total: 12 },
        category: "Networking",
        fees: { type: 'flat', amount: 100000 },
        instructorId: FUNKE.id,
        instructorName: FUNKE.name,
        status: 'published',
        modules: [
            { id: "10-1", title: "MikroTik Setup", items: [{ id: "10-1-1", title: "Routing Intro", type: 'video', url: SAMPLE_VIDEO }] }
        ]
    },
    {
        id: "11",
        title: "Basic Computer Networking",
        description: "Foundational networking concepts.",
        duration: "4 weeks",
        location: "ITeMS Building, UI",
        seats: { enrolled: 10, total: 20 },
        category: "Networking",
        instructorId: FUNKE.id,
        instructorName: FUNKE.name,
        status: 'published',
        fees: {
            type: 'tiered',
            tiers: [
                { name: "Cohort", amount: 80000 },
                { name: "Special", amount: 150000 }
            ]
        },
        modules: [
            { id: "11-1", title: "Networking Basics", items: [{ id: "11-1-1", title: "IP Addressing", type: 'video', url: SAMPLE_VIDEO }] }
        ]
    },
    {
        id: "13",
        title: "Data Science",
        description: "Analytics, modeling, and data-driven insights.",
        duration: "4 months",
        location: "ITeMS Building, UI",
        seats: { enrolled: 12, total: 25 },
        category: "Data Science",
        fees: { type: 'flat', amount: 300000 },
        instructorId: SEUN.id,
        instructorName: SEUN.name,
        status: 'published',
        modules: [
            { id: "13-1", title: "Data Analysis", items: [{ id: "13-1-1", title: "Pandas Intro", type: 'video', url: SAMPLE_VIDEO }] }
        ]
    },
    {
        id: "14",
        title: "Cybersecurity",
        description: "Network security and ethical hacking.",
        duration: "4 months",
        location: "ITeMS Building, UI",
        seats: { enrolled: 8, total: 20 },
        category: "Cybersecurity",
        fees: { type: 'flat', amount: 300000 },
        instructorId: FUNKE.id,
        instructorName: FUNKE.name,
        status: 'published',
        modules: [
            {
                id: "14-1",
                title: "Security Labs",
                items: [
                    { id: "14-1-1", title: "Auth Systems", type: 'video', url: SAMPLE_VIDEO },
                    { id: "14-1-2", title: "Threat Modelling Checkpoint", type: 'quiz', assessmentId: "as-15" }
                ]
            }
        ]
    },
    {
        id: "15",
        title: "Digital Marketing",
        description: "Social media, SEO, and digital growth strategies.",
        duration: "4 months",
        location: "ITeMS Building, UI",
        seats: { enrolled: 20, total: 30 },
        category: "Digital Literacy",
        fees: { type: 'flat', amount: 300000 },
        instructorId: SEUN.id,
        instructorName: SEUN.name,
        status: 'published',
        modules: [
            { id: "15-1", title: "SEO Strategy", items: [{ id: "15-1-1", title: "Search Engines", type: 'video', url: SAMPLE_VIDEO }] }
        ]
    }
];

export const courseMetadata: CourseMetadata = {
    applicationFee: 20000,
    enrollmentRule: "Enrollment is monthly – Class begins at the beginning of a new month.",
    specialPackageRule: "Special Class Package takes a minimum of three (3) and maximum of five (5) students.",
    facilities: [
        "State-of-the-art computers",
        "Conducive environment",
        "Seasoned instructors"
    ],
    contacts: [
        "0803-302-7479",
        "0802-924-8172",
        "0806-273-3470"
    ]
};

/** Courses the demo student has paid for. */
/** Courses the demo student has paid for. Cybersecurity is enrolled but its
 * prerequisite is unpassed, so its entry pass starts locked. */
export const purchasedCourseIds = ["1", "3", "14"];

export const courseCategories = [
    "Software Development",
    "Data Science",
    "Digital Literacy",
    "Cybersecurity",
    "AI & ML",
    "Networking",
];

// Re-export types for compatibility
export type { Course, CourseMetadata, CourseModule, ModuleItem };
