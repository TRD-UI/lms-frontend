import type {
    Assessment,
    AssessmentAttempt,
    AssessmentQuestion,
    Difficulty,
    QuestionType,
} from "./assessment-types";

/**
 * Seed question builder.
 *
 * `correct` is an option index (or list of indices) so the seed stays readable;
 * option ids are derived positionally as "a", "b", "c"…
 */
const q = (
    id: string,
    prompt: string,
    optionLabels: string[],
    correct: number | number[],
    extra: {
        type?: QuestionType;
        difficulty?: Difficulty;
        points?: number;
        tags?: string[];
        explanation?: string;
        remedialModuleId?: string;
    } = {}
): AssessmentQuestion => {
    const options = optionLabels.map((label, i) => ({
        id: String.fromCharCode(97 + i),
        label,
    }));
    const correctIdx = Array.isArray(correct) ? correct : [correct];
    return {
        id,
        prompt,
        type: extra.type ?? (correctIdx.length > 1 ? "multiple" : "single"),
        options,
        correctOptionIds: correctIdx.map((i) => options[i].id),
        explanation: extra.explanation,
        difficulty: extra.difficulty ?? "medium",
        points: extra.points ?? 1,
        tags: extra.tags ?? [],
        remedialModuleId: extra.remedialModuleId,
    };
};

export const assessments: Assessment[] = [
    // ─── Course 1 · Tech Odyssey ───────────────────────────────────────
    {
        id: "as-1",
        courseId: "1",
        title: "Digital Readiness Check",
        description:
            "Confirms you have the baseline computing skills needed before attending the on-site lab. You must pass this to receive your entry pass.",
        kind: "prerequisite",
        status: "published",
        passingScore: 70,
        timeLimitMinutes: 15,
        maxAttempts: 3,
        gatesEntryPass: true,
        createdBy: "Dr. Funke Akindele",
        updatedAt: "Feb 20, 2026",
        questions: [
            q("as-1-q1", "Which of these is a web browser?", ["Photoshop", "Firefox", "Excel", "VLC"], 1, {
                difficulty: "easy",
                tags: ["Digital Literacy"],
                explanation: "Firefox is a browser; the others are desktop applications for other tasks.",
                remedialModuleId: "1-1",
            }),
            q(
                "as-1-q2",
                "What does a file extension such as .pdf or .docx tell you?",
                ["The file's size", "The file's format and which app opens it", "Who created the file", "Where the file is stored"],
                1,
                { difficulty: "easy", tags: ["Digital Literacy"], remedialModuleId: "1-1" }
            ),
            q(
                "as-1-q3",
                "Select every practice that helps keep an online account secure.",
                ["Reusing one password everywhere", "Enabling two-factor authentication", "Using a password manager", "Sharing your password with a colleague"],
                [1, 2],
                {
                    type: "multiple",
                    difficulty: "medium",
                    tags: ["Security"],
                    explanation: "2FA and a password manager both reduce risk. Reuse and sharing both increase it.",
                    remedialModuleId: "1-2",
                }
            ),
            q("as-1-q4", "Keyboard shortcut to copy on Windows?", ["Ctrl + X", "Ctrl + V", "Ctrl + C", "Ctrl + P"], 2, {
                difficulty: "easy",
                tags: ["Digital Literacy"],
                remedialModuleId: "1-1",
            }),
            q(
                "as-1-q5",
                "Cloud storage means your files are held on a remote server rather than only on your device.",
                ["True", "False"],
                0,
                { type: "boolean", difficulty: "easy", tags: ["Digital Literacy"], remedialModuleId: "1-2" }
            ),
        ],
    },
    {
        id: "as-2",
        courseId: "1",
        moduleId: "1-1",
        title: "Web Foundation Checkpoint",
        description: "Covers the HTML, CSS and JavaScript fundamentals from Module 1.",
        kind: "checkpoint",
        status: "published",
        passingScore: 60,
        timeLimitMinutes: 20,
        maxAttempts: 0,
        gatesEntryPass: false,
        createdBy: "Dr. Funke Akindele",
        updatedAt: "Feb 22, 2026",
        questions: [
            q("as-2-q1", "Which HTML tag creates the largest heading?", ["<h6>", "<head>", "<h1>", "<header>"], 2, {
                difficulty: "easy",
                tags: ["HTML"],
                remedialModuleId: "1-1",
            }),
            q("as-2-q2", "In CSS, which property controls the stacking order of elements?", ["position", "display", "z-index", "float"], 2, {
                difficulty: "medium",
                tags: ["CSS"],
                explanation: "z-index sets stacking order for positioned elements.",
                remedialModuleId: "1-2",
            }),
            q(
                "as-2-q3",
                "Select all valid ways to declare a variable in modern JavaScript.",
                ["let", "const", "var", "define"],
                [0, 1, 2],
                { type: "multiple", difficulty: "medium", tags: ["JavaScript"], remedialModuleId: "1-3" }
            ),
            q("as-2-q4", "What does the CSS box model's `padding` control?", ["Space outside the border", "Space between content and border", "The border thickness", "The element's font size"], 1, {
                difficulty: "medium",
                tags: ["CSS"],
                remedialModuleId: "1-2",
            }),
            q("as-2-q5", "`===` in JavaScript compares value and type.", ["True", "False"], 0, {
                type: "boolean",
                difficulty: "medium",
                tags: ["JavaScript"],
                remedialModuleId: "1-3",
            }),
        ],
    },
    {
        id: "as-3",
        courseId: "1",
        title: "Tech Odyssey Capstone",
        description: "Final graded assessment across all three tracks. Required for certification.",
        kind: "final",
        status: "published",
        passingScore: 75,
        timeLimitMinutes: 45,
        maxAttempts: 2,
        gatesEntryPass: false,
        createdBy: "Dr. Funke Akindele",
        updatedAt: "Feb 25, 2026",
        questions: [
            q("as-3-q1", "Which Python data structure is immutable?", ["List", "Dictionary", "Set", "Tuple"], 3, {
                difficulty: "easy",
                tags: ["Python"],
                remedialModuleId: "1-3",
            }),
            q("as-3-q2", "What is the default port for HTTPS?", ["80", "443", "8080", "22"], 1, {
                difficulty: "easy",
                tags: ["Networking"],
            }),
            q(
                "as-3-q3",
                "A race condition occurs when two processes compete for a resource in an unpredictable order.",
                ["True", "False"],
                0,
                { type: "boolean", difficulty: "hard", tags: ["Programming"] }
            ),
            q("as-3-q4", "Which image format supports transparency and lossless compression?", ["JPEG", "PNG", "BMP", "GIF"], 1, {
                difficulty: "medium",
                tags: ["Graphics"],
            }),
        ],
    },

    // ─── Course 2 · Web Development ────────────────────────────────────
    {
        id: "as-4",
        courseId: "2",
        title: "Frontend Entry Test",
        description: "Prerequisite check before joining the Web Development cohort lab.",
        kind: "prerequisite",
        status: "published",
        passingScore: 70,
        timeLimitMinutes: 15,
        maxAttempts: 3,
        gatesEntryPass: true,
        createdBy: "Oluwaseun Fadare",
        updatedAt: "Feb 18, 2026",
        questions: [
            q("as-4-q1", "Which CSS layout system is one-dimensional?", ["Grid", "Flexbox", "Float", "Table"], 1, {
                difficulty: "medium",
                tags: ["CSS"],
                remedialModuleId: "2-1",
            }),
            q("as-4-q2", "HTML stands for…", ["Hyper Text Markup Language", "High Transfer Machine Language", "Hyperlink Text Management Layer", "Home Tool Markup Language"], 0, {
                difficulty: "easy",
                tags: ["HTML"],
                remedialModuleId: "2-1",
            }),
            q("as-4-q3", "Select every valid CSS unit.", ["rem", "px", "vh", "dpi"], [0, 1, 2], {
                type: "multiple",
                difficulty: "medium",
                tags: ["CSS"],
                remedialModuleId: "2-1",
            }),
        ],
    },
    {
        id: "as-5",
        courseId: "2",
        title: "Responsive Design Final",
        description: "Assesses responsive layout, accessibility and deployment knowledge.",
        kind: "final",
        status: "draft",
        passingScore: 75,
        timeLimitMinutes: 30,
        maxAttempts: 2,
        gatesEntryPass: false,
        createdBy: "Oluwaseun Fadare",
        updatedAt: "Feb 26, 2026",
        questions: [
            q("as-5-q1", "Which meta tag is required for responsive scaling on mobile?", ["charset", "viewport", "robots", "author"], 1, {
                difficulty: "medium",
                tags: ["Responsive"],
            }),
            q("as-5-q2", "A media query at `min-width: 768px` targets screens 768px and wider.", ["True", "False"], 0, {
                type: "boolean",
                difficulty: "easy",
                tags: ["Responsive"],
            }),
        ],
    },

    // ─── Course 3 · Python Programming ─────────────────────────────────
    {
        id: "as-6",
        courseId: "3",
        title: "Python Readiness Check",
        description: "Confirms basic programming logic before the first on-site lab session.",
        kind: "prerequisite",
        status: "published",
        passingScore: 70,
        timeLimitMinutes: 15,
        maxAttempts: 3,
        gatesEntryPass: true,
        createdBy: "Dr. Funke Akindele",
        updatedAt: "Feb 19, 2026",
        questions: [
            q("as-6-q1", "What symbol starts a comment in Python?", ["//", "#", "--", "/*"], 1, {
                difficulty: "easy",
                tags: ["Python"],
                remedialModuleId: "3-1",
            }),
            q("as-6-q2", "Which keyword defines a function in Python?", ["func", "function", "def", "lambda"], 2, {
                difficulty: "easy",
                tags: ["Python"],
                remedialModuleId: "3-1",
            }),
            q("as-6-q3", "Python is a statically typed language.", ["True", "False"], 1, {
                type: "boolean",
                difficulty: "medium",
                tags: ["Python"],
                explanation: "Python is dynamically typed — types are resolved at runtime.",
                remedialModuleId: "3-1",
            }),
            q("as-6-q4", "Select every valid Python collection type.", ["list", "tuple", "dict", "array"], [0, 1, 2], {
                type: "multiple",
                difficulty: "medium",
                tags: ["Python", "Data Structures"],
                remedialModuleId: "3-2",
            }),
        ],
    },
    {
        id: "as-7",
        courseId: "3",
        moduleId: "3-2",
        title: "Control Flow Checkpoint",
        description: "Loops, conditionals and comprehensions.",
        kind: "checkpoint",
        status: "published",
        passingScore: 60,
        timeLimitMinutes: 20,
        maxAttempts: 0,
        gatesEntryPass: false,
        createdBy: "Dr. Funke Akindele",
        updatedAt: "Feb 24, 2026",
        questions: [
            q("as-7-q1", "What does `range(3)` produce?", ["1, 2, 3", "0, 1, 2", "0, 1, 2, 3", "3"], 1, {
                difficulty: "easy",
                tags: ["Python"],
                remedialModuleId: "3-2",
            }),
            q("as-7-q2", "Which statement exits a loop immediately?", ["continue", "pass", "break", "return"], 2, {
                difficulty: "easy",
                tags: ["Python"],
                remedialModuleId: "3-2",
            }),
            q("as-7-q3", "A list comprehension is generally faster than an equivalent for-loop append.", ["True", "False"], 0, {
                type: "boolean",
                difficulty: "hard",
                tags: ["Python"],
                remedialModuleId: "3-2",
            }),
        ],
    },
    {
        id: "as-8",
        courseId: "3",
        title: "Python Certification Exam",
        description: "Final graded exam. A pass issues the Python Programming certificate.",
        kind: "final",
        status: "published",
        passingScore: 70,
        timeLimitMinutes: 40,
        maxAttempts: 2,
        gatesEntryPass: false,
        createdBy: "Dr. Funke Akindele",
        updatedAt: "Feb 27, 2026",
        questions: [
            q("as-8-q1", "Which module handles file paths in a cross-platform way?", ["os.path", "sys", "io", "shutil"], 0, {
                difficulty: "medium",
                tags: ["Python"],
            }),
            q("as-8-q2", "What does `len({'a': 1, 'b': 2})` return?", ["1", "2", "4", "TypeError"], 1, {
                difficulty: "medium",
                tags: ["Python"],
            }),
            q("as-8-q3", "Select every truthy value in Python.", ["[1]", "0", "'0'", "None"], [0, 2], {
                type: "multiple",
                difficulty: "hard",
                tags: ["Python"],
                explanation: "Non-empty containers and non-empty strings are truthy; 0 and None are falsy.",
            }),
        ],
    },

    // ─── Course 4 · Digital Literacy ───────────────────────────────────
    {
        id: "as-9",
        courseId: "4",
        title: "Computer Basics Entry Test",
        description: "Required before the Digital Literacy induction session.",
        kind: "prerequisite",
        status: "published",
        passingScore: 60,
        timeLimitMinutes: 10,
        maxAttempts: 3,
        gatesEntryPass: true,
        createdBy: "Oluwaseun Fadare",
        updatedAt: "Feb 15, 2026",
        questions: [
            q("as-9-q1", "Which device is an input device?", ["Monitor", "Printer", "Keyboard", "Speaker"], 2, {
                difficulty: "easy",
                tags: ["Hardware"],
                remedialModuleId: "4-1",
            }),
            q("as-9-q2", "What does 'RAM' stand for?", ["Random Access Memory", "Read Access Mode", "Remote Access Module", "Rapid Archive Memory"], 0, {
                difficulty: "easy",
                tags: ["Hardware"],
                remedialModuleId: "4-1",
            }),
            q("as-9-q3", "A phishing email tries to trick you into revealing sensitive information.", ["True", "False"], 0, {
                type: "boolean",
                difficulty: "easy",
                tags: ["Security"],
                remedialModuleId: "4-1",
            }),
        ],
    },
    {
        id: "as-10",
        courseId: "4",
        title: "Productivity Tools Final",
        description: "Word processing, spreadsheets and presentation software.",
        kind: "final",
        status: "published",
        passingScore: 65,
        timeLimitMinutes: 25,
        maxAttempts: 2,
        gatesEntryPass: false,
        createdBy: "Oluwaseun Fadare",
        updatedAt: "Feb 21, 2026",
        questions: [
            q("as-10-q1", "In a spreadsheet, which symbol begins a formula?", ["#", "=", "@", "$"], 1, {
                difficulty: "easy",
                tags: ["Excel"],
            }),
            q("as-10-q2", "Which function totals a range of cells?", ["COUNT", "AVERAGE", "SUM", "MAX"], 2, {
                difficulty: "easy",
                tags: ["Excel"],
            }),
        ],
    },

    // ─── Course 9 · Generative AI ──────────────────────────────────────
    {
        id: "as-11",
        courseId: "9",
        title: "AI Foundations Check",
        description: "Prerequisite for the Generative AI workshop.",
        kind: "prerequisite",
        status: "published",
        passingScore: 70,
        timeLimitMinutes: 15,
        maxAttempts: 3,
        gatesEntryPass: true,
        createdBy: "Dr. Funke Akindele",
        updatedAt: "Feb 23, 2026",
        questions: [
            q("as-11-q1", "What does a 'prompt' refer to in generative AI?", ["The model's training data", "The instruction given to the model", "The model's parameter count", "The output format"], 1, {
                difficulty: "easy",
                tags: ["AI"],
                remedialModuleId: "9-1",
            }),
            q("as-11-q2", "Select every practice that improves prompt quality.", ["Giving clear context", "Specifying the desired format", "Being deliberately vague", "Providing examples"], [0, 1, 3], {
                type: "multiple",
                difficulty: "medium",
                tags: ["AI"],
                remedialModuleId: "9-1",
            }),
            q("as-11-q3", "Generative models can produce confident but factually wrong output.", ["True", "False"], 0, {
                type: "boolean",
                difficulty: "medium",
                tags: ["AI", "Ethics"],
                explanation: "Commonly called hallucination — always verify factual claims.",
                remedialModuleId: "9-1",
            }),
        ],
    },

    // ─── Course 13 · Data Science ──────────────────────────────────────
    {
        id: "as-12",
        courseId: "13",
        title: "Statistics Readiness",
        description: "Baseline statistics knowledge required before the Data Science lab.",
        kind: "prerequisite",
        status: "published",
        passingScore: 75,
        timeLimitMinutes: 20,
        maxAttempts: 3,
        gatesEntryPass: true,
        createdBy: "Oluwaseun Fadare",
        updatedAt: "Feb 17, 2026",
        questions: [
            q("as-12-q1", "Which measure is most affected by outliers?", ["Median", "Mode", "Mean", "Range"], 2, {
                difficulty: "medium",
                tags: ["Statistics"],
                remedialModuleId: "13-1",
            }),
            q("as-12-q2", "Correlation implies causation.", ["True", "False"], 1, {
                type: "boolean",
                difficulty: "easy",
                tags: ["Statistics"],
                remedialModuleId: "13-1",
            }),
            q("as-12-q3", "Which library is the standard for dataframes in Python?", ["NumPy", "Pandas", "Matplotlib", "SciPy"], 1, {
                difficulty: "easy",
                tags: ["Python", "Data Science"],
                remedialModuleId: "13-1",
            }),
        ],
    },
    {
        id: "as-13",
        courseId: "13",
        title: "Modelling Final Exam",
        description: "Regression, classification and model evaluation.",
        kind: "final",
        status: "draft",
        passingScore: 75,
        timeLimitMinutes: 45,
        maxAttempts: 2,
        gatesEntryPass: false,
        createdBy: "Oluwaseun Fadare",
        updatedAt: "Feb 28, 2026",
        questions: [
            q("as-13-q1", "Which metric suits an imbalanced classification problem?", ["Accuracy", "F1 score", "Mean squared error", "R-squared"], 1, {
                difficulty: "hard",
                tags: ["Machine Learning"],
            }),
            q("as-13-q2", "Overfitting means the model performs well on training data but poorly on unseen data.", ["True", "False"], 0, {
                type: "boolean",
                difficulty: "medium",
                tags: ["Machine Learning"],
            }),
        ],
    },

    // ─── Course 14 · Cybersecurity ─────────────────────────────────────
    {
        id: "as-14",
        courseId: "14",
        title: "Security Fundamentals Gate",
        description: "Mandatory prerequisite. Controls access to the hands-on security lab.",
        kind: "prerequisite",
        status: "published",
        passingScore: 80,
        timeLimitMinutes: 20,
        maxAttempts: 3,
        gatesEntryPass: true,
        createdBy: "Dr. Funke Akindele",
        updatedAt: "Feb 16, 2026",
        questions: [
            q("as-14-q1", "Which protocol operates at the transport layer of the OSI model?", ["HTTP", "TCP", "IP", "ARP"], 1, {
                difficulty: "medium",
                tags: ["Networking", "OSI Model"],
                remedialModuleId: "14-1",
            }),
            q("as-14-q2", "What is the primary purpose of a firewall?", ["Speed up the network", "Filter traffic", "Store data", "Compress files"], 1, {
                difficulty: "easy",
                tags: ["Security"],
                remedialModuleId: "14-1",
            }),
            q("as-14-q3", "Which encryption standard is considered most secure?", ["DES", "3DES", "AES-256", "RC4"], 2, {
                difficulty: "hard",
                tags: ["Encryption"],
                remedialModuleId: "14-1",
            }),
            q("as-14-q4", "Select every factor that qualifies as multi-factor authentication.", ["Something you know", "Something you have", "Something you are", "Something you want"], [0, 1, 2], {
                type: "multiple",
                difficulty: "medium",
                tags: ["Security"],
                remedialModuleId: "14-1",
            }),
        ],
    },
    {
        id: "as-15",
        courseId: "14",
        moduleId: "14-1",
        title: "Threat Modelling Checkpoint",
        description: "Attack surfaces, threat actors and mitigation strategy.",
        kind: "checkpoint",
        status: "published",
        passingScore: 65,
        timeLimitMinutes: 25,
        maxAttempts: 0,
        gatesEntryPass: false,
        createdBy: "Dr. Funke Akindele",
        updatedAt: "Feb 26, 2026",
        questions: [
            q("as-15-q1", "A zero-day is a vulnerability with no available patch at disclosure time.", ["True", "False"], 0, {
                type: "boolean",
                difficulty: "medium",
                tags: ["Security"],
                remedialModuleId: "14-1",
            }),
            q("as-15-q2", "Which attack floods a service to make it unavailable?", ["SQL injection", "Denial of service", "Phishing", "Privilege escalation"], 1, {
                difficulty: "easy",
                tags: ["Security"],
                remedialModuleId: "14-1",
            }),
        ],
    },
    {
        id: "as-16",
        courseId: "14",
        title: "Cybersecurity Certification Exam",
        description: "Final exam. A pass issues the Cybersecurity certificate.",
        kind: "final",
        status: "published",
        passingScore: 80,
        timeLimitMinutes: 60,
        maxAttempts: 2,
        gatesEntryPass: false,
        createdBy: "Dr. Funke Akindele",
        updatedAt: "Feb 28, 2026",
        questions: [
            q("as-16-q1", "What does the principle of least privilege require?", ["Users get admin by default", "Users get only the access they need", "All users share one account", "Access is never revoked"], 1, {
                difficulty: "medium",
                tags: ["Security"],
            }),
            q("as-16-q2", "Hashing is reversible; encryption is not.", ["True", "False"], 1, {
                type: "boolean",
                difficulty: "hard",
                tags: ["Encryption"],
                explanation: "It is the other way round — encryption is reversible with a key, hashing is one-way.",
            }),
        ],
    },

    // ─── Course 15 · Digital Marketing ─────────────────────────────────
    {
        id: "as-17",
        courseId: "15",
        title: "Marketing Fundamentals Check",
        description: "Prerequisite for the Digital Marketing cohort.",
        kind: "prerequisite",
        status: "published",
        passingScore: 65,
        timeLimitMinutes: 15,
        maxAttempts: 3,
        gatesEntryPass: true,
        createdBy: "Oluwaseun Fadare",
        updatedAt: "Feb 14, 2026",
        questions: [
            q("as-17-q1", "What does SEO stand for?", ["Search Engine Optimisation", "Social Engagement Output", "Site Entry Operation", "Search Entry Order"], 0, {
                difficulty: "easy",
                tags: ["SEO"],
                remedialModuleId: "15-1",
            }),
            q("as-17-q2", "Which metric measures the share of visitors who take a desired action?", ["Bounce rate", "Conversion rate", "Impressions", "Reach"], 1, {
                difficulty: "medium",
                tags: ["Analytics"],
                remedialModuleId: "15-1",
            }),
        ],
    },
];

/**
 * Seed attempt history for the demo student (u-1, "Cyber Smith" persona).
 * Gives the dashboard something to show before any quiz is taken this session.
 */
export const seedAttempts: AssessmentAttempt[] = [
    {
        id: "at-1",
        assessmentId: "as-6",
        courseId: "3",
        studentId: "st-demo",
        studentName: "Cyber Smith",
        answers: [],
        score: 100,
        pointsEarned: 4,
        pointsPossible: 4,
        passed: true,
        submittedAt: "2026-02-20T10:24:00.000Z",
        durationSeconds: 412,
        attemptNumber: 1,
    },
    {
        id: "at-2",
        assessmentId: "as-1",
        courseId: "1",
        studentId: "st-demo",
        studentName: "Cyber Smith",
        answers: [],
        score: 40,
        pointsEarned: 2,
        pointsPossible: 5,
        passed: false,
        submittedAt: "2026-02-21T14:02:00.000Z",
        durationSeconds: 388,
        attemptNumber: 1,
    },
    {
        id: "at-3",
        assessmentId: "as-1",
        courseId: "1",
        studentId: "st-demo",
        studentName: "Cyber Smith",
        answers: [],
        score: 80,
        pointsEarned: 4,
        pointsPossible: 5,
        passed: true,
        submittedAt: "2026-02-22T09:15:00.000Z",
        durationSeconds: 305,
        attemptNumber: 2,
    },
];
