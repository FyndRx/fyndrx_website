1. What technologies or methodologies do you plan to use?

We will use an offline-first mobile application built with Flutter, backed by a secure local database (SQLite/Isar) to enable uninterrupted operation in low-connectivity communities. The solution will integrate lightweight on-device AI models (TensorFlow Lite or ONNX Runtime) for maternal, newborn, and under-five risk assessment, combined with a rule-based clinical decision engine based on WHO and Ghana Health Service guidelines.

To improve community outreach, we will incorporate GIS mapping to record household locations, optimize visit planning, and identify clusters of high-risk households. The platform will be developed using a human-centred, community-led design methodology, working closely with CHPS workers, midwives, and nutrition officers to ensure the solution fits existing workflows and addresses real operational challenges.

2. Offline-First & Low-Connectivity Functionality: How will your software stack, database structure, or AI engine execute models where internet connection is unstable or unavailable?

Our solution is designed with an Edge AI architecture, meaning all core functionality runs directly on the mobile device without requiring internet access.

Patient records, household information, clinical guidelines, and AI models are stored securely in an encrypted local database. During household visits, CHPS workers can register patients, assess maternal and child health, receive AI-supported risk assessments, access nutrition guidance, and generate referral recommendations entirely offline.

When connectivity becomes available, the application automatically synchronizes new records, downloads updated AI models and clinical guidelines, and securely backs up data to the central server. This ensures continuous service delivery while minimizing data usage and supporting health workers in remote communities.

3. AI Transparency & Explainability: How does your system explain its AI-generated recommendations simply to non-specialised frontline workers? How do you ensure it assists rather than replaces them?

Our AI is designed as a clinical decision support tool, not an autonomous decision-maker. Every recommendation is accompanied by a simple explanation of the factors that influenced the result.

For example, instead of displaying only "High Risk Pregnancy," the application explains:

Elevated blood pressure
Low haemoglobin level
Previous pregnancy complications
Severe headache reported

The system then recommends an appropriate next step, such as monitor closely, schedule an earlier follow-up, or refer to the nearest health facility, with references to established clinical guidelines.

Health workers always retain the final decision-making authority. They can review the AI's reasoning, accept or override its recommendation, and record their clinical judgement. This transparent, explainable approach builds trust, supports less experienced health workers, and ensures AI enhances—rather than replaces—professional expertise.
