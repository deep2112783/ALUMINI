-- Realistic seed data for testing
-- Passwords are all "password123" (hashed with bcrypt)

-- Users - Students, Alumni, and Faculty
INSERT INTO users (email, role, password, is_first_login, is_active) VALUES
  -- Students
  ('rajesh.kumar@rguktrkv.ac.in', 'student', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true),
  ('priya.sharma@rguktrkv.ac.in', 'student', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true),
  ('anil.reddy@rguktrkv.ac.in', 'student', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true),
  ('sneha.patel@rguktrkv.ac.in', 'student', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true),
  ('karthik.venkat@rguktrkv.ac.in', 'student', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true),
  
  -- Alumni
  ('arjun.mehta@rguktrkv.ac.in', 'alumni', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true),
  ('divya.singh@rguktrkv.ac.in', 'alumni', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true),
  ('rahul.verma@rguktrkv.ac.in', 'alumni', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true),
  ('anjali.nair@rguktrkv.ac.in', 'alumni', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true),
  ('vikram.rao@rguktrkv.ac.in', 'alumni', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true),
  ('priya.krishnan@rguktrkv.ac.in', 'alumni', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true),
  ('sanjay.gupta@rguktrkv.ac.in', 'alumni', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true),
  ('meera.reddy@rguktrkv.ac.in', 'alumni', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true),
  ('rohit.sharma@rguktrkv.ac.in', 'alumni', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true),
  ('nisha.iyer@rguktrkv.ac.in', 'alumni', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true),
  ('amit.patel@rguktrkv.ac.in', 'alumni', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true),
  ('kavya.menon@rguktrkv.ac.in', 'alumni', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true),
  ('suresh.kumar@rguktrkv.ac.in', 'alumni', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true),
  ('pooja.desai@rguktrkv.ac.in', 'alumni', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true),
  ('ravi.chandra@rguktrkv.ac.in', 'alumni', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true),
  
  -- Faculty
  ('dr.ramesh@rguktrkv.ac.in', 'faculty', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true),
  ('prof.lakshmi@rguktrkv.ac.in', 'faculty', '$2a$10$fke1xGgBG4Md2EdHD/Bz3uneXV3nPuMTMXc6sWhFLcEILrhc4gZny', false, true)
ON CONFLICT (email) DO NOTHING;

-- Student Profiles
INSERT INTO students (user_id, department, year, skills, bio)
SELECT id, 'Computer Science', 'E3', 'JavaScript, React, Node.js, Python', 'Third-year CSE student passionate about web development and AI. Looking to connect with alumni in tech industry.'
FROM users WHERE email='rajesh.kumar@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO students (user_id, department, year, skills, bio)
SELECT id, 'Electronics & Communication', 'E4', 'VLSI, Embedded Systems, C++, Arduino', 'Final year ECE student interested in IoT and embedded systems. Seeking guidance for higher studies.'
FROM users WHERE email='priya.sharma@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO students (user_id, department, year, skills, bio)
SELECT id, 'Computer Science', 'E3', 'Java, Spring Boot, SQL, AWS', 'Pre-final year student preparing for campus placements. Interested in backend development.'
FROM users WHERE email='anil.reddy@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO students (user_id, department, year, skills, bio)
SELECT id, 'Mechanical Engineering', 'E2', 'AutoCAD, SolidWorks, MATLAB', 'Mechanical engineering student with interest in robotics and automation.'
FROM users WHERE email='sneha.patel@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO students (user_id, department, year, skills, bio)
SELECT id, 'Computer Science', 'E2', 'Python, Machine Learning, TensorFlow, Data Science', 'ML enthusiast working on computer vision projects. Love to explore AI applications.'
FROM users WHERE email='karthik.venkat@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

-- Alumni Profiles
INSERT INTO alumni (user_id, company, role, expertise)
SELECT id, 'Google', 'Software Engineer', 'Full Stack Development, System Design, Microservices, React, Go'
FROM users WHERE email='arjun.mehta@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO alumni (user_id, company, role, expertise)
SELECT id, 'Amazon', 'Data Scientist', 'Machine Learning, NLP, Python, AWS SageMaker, Deep Learning'
FROM users WHERE email='divya.singh@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO alumni (user_id, company, role, expertise)
SELECT id, 'Microsoft', 'Senior SDE', 'Cloud Architecture, Azure, .NET, C#, Distributed Systems'
FROM users WHERE email='rahul.verma@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO alumni (user_id, company, role, expertise)
SELECT id, 'Goldman Sachs', 'Quantitative Analyst', 'Algorithmic Trading, Python, C++, Financial Modeling'
FROM users WHERE email='anjali.nair@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO alumni (user_id, company, role, expertise)
SELECT id, 'Tesla', 'Embedded Systems Engineer', 'Automotive Systems, C/C++, Real-time OS, Hardware Design'
FROM users WHERE email='vikram.rao@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO alumni (user_id, company, role, expertise)
SELECT id, 'Flipkart', 'Product Manager', 'Product Strategy, Agile, User Research, Analytics, A/B Testing'
FROM users WHERE email='priya.krishnan@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO alumni (user_id, company, role, expertise)
SELECT id, 'Adobe', 'Frontend Engineer', 'React, TypeScript, UI/UX, Performance Optimization, Web Accessibility'
FROM users WHERE email='sanjay.gupta@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO alumni (user_id, company, role, expertise)
SELECT id, 'Uber', 'Backend Engineer', 'Microservices, Kafka, Redis, PostgreSQL, Go, Kubernetes'
FROM users WHERE email='meera.reddy@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO alumni (user_id, company, role, expertise)
SELECT id, 'Netflix', 'DevOps Engineer', 'CI/CD, Docker, Kubernetes, AWS, Terraform, Monitoring'
FROM users WHERE email='rohit.sharma@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO alumni (user_id, company, role, expertise)
SELECT id, 'Salesforce', 'Security Engineer', 'Application Security, Penetration Testing, OWASP, Secure Coding'
FROM users WHERE email='nisha.iyer@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO alumni (user_id, company, role, expertise)
SELECT id, 'Oracle', 'Database Engineer', 'SQL, PL/SQL, Database Optimization, NoSQL, Data Modeling'
FROM users WHERE email='amit.patel@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO alumni (user_id, company, role, expertise)
SELECT id, 'PayPal', 'iOS Developer', 'Swift, SwiftUI, iOS SDK, Mobile Architecture, App Store Optimization'
FROM users WHERE email='kavya.menon@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO alumni (user_id, company, role, expertise)
SELECT id, 'Walmart Labs', 'AI/ML Engineer', 'Computer Vision, PyTorch, MLOps, Model Deployment, NLP'
FROM users WHERE email='suresh.kumar@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO alumni (user_id, company, role, expertise)
SELECT id, 'Atlassian', 'Full Stack Developer', 'Java, Spring, React, PostgreSQL, REST APIs, Microservices'
FROM users WHERE email='pooja.desai@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO alumni (user_id, company, role, expertise)
SELECT id, 'LinkedIn', 'Data Engineer', 'Spark, Hadoop, Data Pipelines, ETL, Airflow, Big Data'
FROM users WHERE email='ravi.chandra@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

-- Faculty Profiles
INSERT INTO faculty (user_id, department, bio, office_location)
SELECT id, 'Computer Science & Engineering', 'Professor with 15 years of experience in Data Structures and Algorithms. Research interests include Graph Theory and Optimization.', 'Academic Block A, Room 301'
FROM users WHERE email='dr.ramesh@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO faculty (user_id, department, bio, office_location)
SELECT id, 'Electronics & Communication', 'Associate Professor specializing in Signal Processing and Communication Systems. Mentor for student projects.', 'Academic Block B, Room 205'
FROM users WHERE email='prof.lakshmi@rguktrkv.ac.in'
ON CONFLICT (user_id) DO NOTHING;

-- Communities
INSERT INTO communities (name, domain, description) VALUES 
  ('Web Development', 'Technology', 'Learn and discuss modern web development - React, Node.js, Angular, Vue.js, and more.'),
  ('Data Science & Machine Learning', 'Technology', 'Explore ML algorithms, AI applications, data analysis, and predictive modeling.'),
  ('Mobile App Development', 'Technology', 'Android, iOS, Flutter, React Native - everything mobile development.'),
  ('Career & Placements', 'Career', 'Job opportunities, interview preparation, resume tips, and placement experiences.'),
  ('Competitive Programming', 'Technology', 'DSA, coding contests, LeetCode, CodeForces, and interview prep.'),
  ('Entrepreneurship & Startups', 'Business', 'Discuss startup ideas, business strategies, and entrepreneurial journeys.'),
  ('Cloud & DevOps', 'Technology', 'AWS, Azure, Docker, Kubernetes, CI/CD, and cloud architecture.'),
  ('Design & UI/UX', 'Design', 'UI design, UX research, Figma, prototyping, and user experience best practices.')
ON CONFLICT (name) DO NOTHING;

-- Add members to communities
INSERT INTO community_members (user_id, community_id, joined_at)
SELECT u.id, c.id, NOW() - INTERVAL '10 days'
FROM users u, communities c
WHERE u.email='rajesh.kumar@rguktrkv.ac.in' AND c.name IN ('Web Development', 'Competitive Programming', 'Career & Placements')
ON CONFLICT DO NOTHING;

INSERT INTO community_members (user_id, community_id, joined_at)
SELECT u.id, c.id, NOW() - INTERVAL '8 days'
FROM users u, communities c
WHERE u.email='priya.sharma@rguktrkv.ac.in' AND c.name IN ('Mobile App Development', 'Career & Placements')
ON CONFLICT DO NOTHING;

INSERT INTO community_members (user_id, community_id, joined_at)
SELECT u.id, c.id, NOW() - INTERVAL '5 days'
FROM users u, communities c
WHERE u.email='karthik.venkat@rguktrkv.ac.in' AND c.name IN ('Data Science & Machine Learning', 'Competitive Programming')
ON CONFLICT DO NOTHING;

INSERT INTO community_members (user_id, community_id, joined_at)
SELECT u.id, c.id, NOW() - INTERVAL '15 days'
FROM users u, communities c
WHERE u.email='arjun.mehta@rguktrkv.ac.in' AND c.name IN ('Web Development', 'Career & Placements', 'Cloud & DevOps')
ON CONFLICT DO NOTHING;

INSERT INTO community_members (user_id, community_id, joined_at)
SELECT u.id, c.id, NOW() - INTERVAL '12 days'
FROM users u, communities c
WHERE u.email='divya.singh@rguktrkv.ac.in' AND c.name IN ('Data Science & Machine Learning', 'Career & Placements')
ON CONFLICT DO NOTHING;

INSERT INTO community_members (user_id, community_id, joined_at)
SELECT u.id, c.id, NOW() - INTERVAL '7 days'
FROM users u, communities c
WHERE u.email='anil.reddy@rguktrkv.ac.in' AND c.name IN ('Cloud & DevOps', 'Career & Placements', 'Web Development')
ON CONFLICT DO NOTHING;

-- Forum Questions
INSERT INTO forum_questions (community_id, user_id, title, content, created_at)
SELECT c.id, u.id, 'React vs Angular - Which to learn first?', 'I want to get into frontend development. Should I learn React or Angular? What are the job market trends? I know JavaScript basics already.', NOW() - INTERVAL '3 days'
FROM users u, communities c
WHERE u.email='rajesh.kumar@rguktrkv.ac.in' AND c.name='Web Development';

INSERT INTO forum_questions (community_id, user_id, title, content, created_at)
SELECT c.id, u.id, 'How to prepare for product-based companies?', 'I am in my pre-final year and want to start preparing for companies like Google, Microsoft, Amazon. What topics should I focus on? How many questions should I solve daily?', NOW() - INTERVAL '2 days'
FROM users u, communities c
WHERE u.email='anil.reddy@rguktrkv.ac.in' AND c.name='Career & Placements';

INSERT INTO forum_questions (community_id, user_id, title, content, created_at)
SELECT c.id, u.id, 'Best approach for dynamic programming?', 'I struggle with DP problems in coding contests. What is the best way to master dynamic programming? Any specific practice problems recommended?', NOW() - INTERVAL '1 day'
FROM users u, communities c
WHERE u.email='rajesh.kumar@rguktrkv.ac.in' AND c.name='Competitive Programming';

INSERT INTO forum_questions (community_id, user_id, title, content, created_at)
SELECT c.id, u.id, 'Best datasets for beginner ML projects?', 'I am starting with machine learning and looking for interesting datasets to practice. Can someone suggest good datasets for classification and regression problems?', NOW() - INTERVAL '5 hours'
FROM users u, communities c
WHERE u.email='karthik.venkat@rguktrkv.ac.in' AND c.name='Data Science & Machine Learning';

INSERT INTO forum_questions (community_id, user_id, title, content, created_at)
SELECT c.id, u.id, 'Flutter vs React Native for mobile development?', 'I want to build cross-platform mobile apps. Should I go with Flutter or React Native? What are the pros and cons of each?', NOW() - INTERVAL '6 hours'
FROM users u, communities c
WHERE u.email='priya.sharma@rguktrkv.ac.in' AND c.name='Mobile App Development';

INSERT INTO forum_questions (community_id, user_id, title, content, created_at)
SELECT c.id, u.id, 'Tips for AWS certification preparation?', 'I want to get AWS Solutions Architect certification. Any study resources or tips from alumni who have cleared it? How long did it take you to prepare?', NOW() - INTERVAL '4 hours'
FROM users u, communities c
WHERE u.email='anil.reddy@rguktrkv.ac.in' AND c.name='Cloud & DevOps';

INSERT INTO forum_questions (community_id, user_id, title, content, created_at)
SELECT c.id, u.id, 'Advice on building a startup during college?', 'I have a product idea and want to start building it. Should I focus on academics first or start working on the startup? How do I find co-founders and initial funding?', NOW() - INTERVAL '8 hours'
FROM users u, communities c
WHERE u.email='sneha.patel@rguktrkv.ac.in' AND c.name='Entrepreneurship & Startups';

INSERT INTO forum_questions (community_id, user_id, title, content, created_at)
SELECT c.id, u.id, 'UI/UX design portfolio tips for beginners?', 'I am learning UI/UX design and want to create a portfolio. What kind of projects should I include? Any tools or templates recommended?', NOW() - INTERVAL '12 hours'
FROM users u, communities c
WHERE u.email='rajesh.kumar@rguktrkv.ac.in' AND c.name='Design & UI/UX';

-- Forum Answers
INSERT INTO forum_answers (question_id, user_id, content, created_at)
SELECT fq.id, u.id, 'React has better job opportunities currently and an easier learning curve. I would suggest starting with React. Once you master it, learning Angular becomes easier if needed. Focus on building real projects - that is the best way to learn.', NOW() - INTERVAL '2 days'
FROM users u, forum_questions fq
WHERE u.email='arjun.mehta@rguktrkv.ac.in' AND fq.title LIKE '%React vs Angular%';

INSERT INTO forum_answers (question_id, user_id, content, created_at)
SELECT fq.id, u.id, 'Start with Striver A2Z DSA sheet and LeetCode daily challenges. Focus on understanding patterns rather than just solving problems. Aim for 2-3 problems daily with proper revision. At Google, we look for problem-solving approach more than the solution itself.', NOW() - INTERVAL '1 day'
FROM users u, forum_questions fq
WHERE u.email='arjun.mehta@rguktrkv.ac.in' AND fq.title LIKE '%product-based companies%';

INSERT INTO forum_answers (question_id, user_id, content, created_at)
SELECT fq.id, u.id, 'For ML beginners, start with Kaggle datasets like Titanic, House Prices, or Iris. They are perfect for learning classification and regression. Also check out UCI ML Repository. Focus on understanding the problem first before jumping into models.', NOW() - INTERVAL '4 hours'
FROM users u, forum_questions fq
WHERE u.email='divya.singh@rguktrkv.ac.in' AND fq.title LIKE '%datasets for beginner ML%';

INSERT INTO forum_answers (question_id, user_id, content, created_at)
SELECT fq.id, u.id, 'I use Flutter at work and love it! Pros: Single codebase, great performance, beautiful UI. Cons: Larger app size, less mature ecosystem than React Native. If you know JavaScript, go with React Native. If starting fresh, Flutter is amazing and growing fast.', NOW() - INTERVAL '5 hours'
FROM users u, forum_questions fq
WHERE u.email='vikram.rao@rguktrkv.ac.in' AND fq.title LIKE '%Flutter vs React Native%';

INSERT INTO forum_answers (question_id, user_id, content, created_at)
SELECT fq.id, u.id, 'I cleared AWS SA Associate in 2 months. Used Adrian Cantrill course (highly recommended) and practiced with Tutorials Dojo practice exams. Study for 1-2 hours daily. Focus on understanding services deeply rather than memorizing. At Microsoft, AWS knowledge is valuable for cloud architecture discussions.', NOW() - INTERVAL '3 hours'
FROM users u, forum_questions fq
WHERE u.email='rahul.verma@rguktrkv.ac.in' AND fq.title LIKE '%AWS certification%';

INSERT INTO forum_answers (question_id, user_id, content, created_at)
SELECT fq.id, u.id, 'Balance is key! I started my company during final year. Keep grades decent but dedicate weekends to your startup. Find co-founders in your college - attend hackathons and tech events. For funding, start with your own savings, then look at incubators like T-Hub or government schemes like Startup India.', NOW() - INTERVAL '7 hours'
FROM users u, forum_questions fq
WHERE u.email='priya.krishnan@rguktrkv.ac.in' AND fq.title LIKE '%startup during college%';

INSERT INTO forum_answers (question_id, user_id, content, created_at)
SELECT fq.id, u.id, 'At Adobe, we value portfolios that show your design thinking process. Include 3-4 projects: redesign an existing app, create a new product concept, and a passion project. Use Figma for designs and Behance/Dribbble to showcase. Document your research, wireframes, and iterations - not just final designs.', NOW() - INTERVAL '10 hours'
FROM users u, forum_questions fq
WHERE u.email='sanjay.gupta@rguktrkv.ac.in' AND fq.title LIKE '%UI/UX design portfolio%';

INSERT INTO forum_answers (question_id, user_id, content, created_at)
SELECT fq.id, u.id, 'Dynamic programming is all about practice and pattern recognition. Start with 1D DP (Fibonacci, climbing stairs), then move to 2D (knapsack, LCS). Watch Aditya Verma DP playlist on YouTube - it is gold! Solve at least 50 DP problems and you will start seeing patterns. Happy to help if you are stuck on specific problems!', NOW() - INTERVAL '20 hours'
FROM users u, forum_questions fq
WHERE u.email='divya.singh@rguktrkv.ac.in' AND fq.title LIKE '%dynamic programming%';

INSERT INTO forum_answers (question_id, user_id, content, created_at)
SELECT fq.id, u.id, 'Microservices at Uber taught me a lot! Key points: Start with understanding why we need them (scalability, independent deployment). Learn Docker and Kubernetes - essential skills. Practice building a simple project with 2-3 microservices. Use API Gateway pattern and learn about service discovery. Cloud & DevOps skills go hand-in-hand!', NOW() - INTERVAL '2 hours'
FROM users u, forum_questions fq
WHERE u.email='meera.reddy@rguktrkv.ac.in' AND fq.title LIKE '%Cloud%';

-- Alumni Insights
INSERT INTO alumni_insights (author_id, title, content, category, created_at)
SELECT u.id, 'How I cracked Google SDE Interview', 'My journey from RGUKT to Google was challenging but rewarding. Here are my key takeaways:

1. Strong fundamentals in DSA are essential. Focus on understanding rather than memorizing.
2. System design is crucial for senior roles. Start learning early.
3. Practice mock interviews with peers.
4. LeetCode Medium level is sufficient for most companies.
5. Communication skills matter as much as coding skills.

I practiced for 6 months consistently, solving 300+ problems. The key is consistency and learning from mistakes. Happy to answer specific questions!', 'Career Guidance', NOW() - INTERVAL '5 days'
FROM users u WHERE u.email='arjun.mehta@rguktrkv.ac.in';

INSERT INTO alumni_insights (author_id, title, content, category, created_at)
SELECT u.id, 'Transitioning from Dev to Data Science', 'After working as a software engineer for 2 years, I transitioned to data science at Amazon. Here is my story:

Started with online courses (Andrew Ng ML course is excellent). Built 3-4 projects showcasing end-to-end ML pipeline. Contributed to open source ML libraries. 

Key skills needed: Python, Statistics, ML algorithms, SQL, and domain knowledge. AWS/Cloud experience is a plus.

The transition took me 8 months of dedicated learning alongside my job. Totally worth it!', 'Career Guidance', NOW() - INTERVAL '3 days'
FROM users u WHERE u.email='divya.singh@rguktrkv.ac.in';

INSERT INTO alumni_insights (author_id, title, content, category, created_at)
SELECT u.id, 'My Microsoft Interview Experience', 'Recently interviewed with Microsoft for SDE-2 role. Here is the process:

Round 1: Online assessment - 2 coding questions (Medium level)
Round 2: Technical round - DSA + System design
Round 3: Technical + Behavioral
Round 4: Hiring manager round

Tips: Be prepared for system design even for SDE-2. They focus a lot on scalability and trade-offs. Know your resume projects deeply. Practice explaining your thought process clearly.

Preparation time: 3 months. Resources used: Grokking System Design, LeetCode, Educative.', 'Interview Experience', NOW() - INTERVAL '1 day'
FROM users u WHERE u.email='rahul.verma@rguktrkv.ac.in';

-- Events
INSERT INTO events (title, date, location, description, organizer_id)
SELECT 'Alumni Talk: Career in Tech', NOW() + INTERVAL '7 days', 'Main Auditorium', 'Join us for an insightful session with Google and Amazon alumni sharing their career journey, interview tips, and industry trends. Q&A session included.', u.id
FROM users u WHERE u.email='dr.ramesh@rguktrkv.ac.in';

INSERT INTO events (title, date, location, description, organizer_id)
SELECT 'Hackathon 2025', NOW() + INTERVAL '14 days', 'Innovation Lab', '24-hour coding hackathon with exciting prizes. Build innovative solutions to real-world problems. Teams of 2-4 members. Register now!', u.id
FROM users u WHERE u.email='prof.lakshmi@rguktrkv.ac.in';

INSERT INTO events (title, date, location, description, organizer_id)
SELECT 'Placement Preparation Workshop', NOW() + INTERVAL '3 days', 'Seminar Hall B', 'Comprehensive workshop on resume building, aptitude, and technical interview preparation. Mock interviews will be conducted.', u.id
FROM users u WHERE u.email='dr.ramesh@rguktrkv.ac.in';

-- Event Registrations
INSERT INTO event_registrations (user_id, event_id, status)
SELECT u.id, e.id, 'confirmed'
FROM users u, events e
WHERE u.email='rajesh.kumar@rguktrkv.ac.in' AND e.title LIKE '%Alumni Talk%'
ON CONFLICT DO NOTHING;

INSERT INTO event_registrations (user_id, event_id, status)
SELECT u.id, e.id, 'confirmed'
FROM users u, events e
WHERE u.email='karthik.venkat@rguktrkv.ac.in' AND e.title LIKE '%Hackathon%'
ON CONFLICT DO NOTHING;

-- Notifications
INSERT INTO notifications (user_id, type, content, read_status, created_at)
SELECT u.id, 'event', 'New event: Alumni Talk: Career in Tech - Register now!', false, NOW() - INTERVAL '2 days'
FROM users u WHERE u.email IN ('rajesh.kumar@rguktrkv.ac.in', 'anil.reddy@rguktrkv.ac.in', 'karthik.venkat@rguktrkv.ac.in');

INSERT INTO notifications (user_id, type, content, read_status, created_at)
SELECT u.id, 'insight', 'New insight posted: How I cracked Google SDE Interview', false, NOW() - INTERVAL '5 days'
FROM users u WHERE u.email='rajesh.kumar@rguktrkv.ac.in';

INSERT INTO notifications (user_id, type, content, read_status, created_at)
SELECT fq.user_id, 'answer', 'Your question about Operating Systems received a new answer!', false, NOW() - INTERVAL '2 days'
FROM forum_questions fq WHERE fq.title LIKE '%Operating Systems%';

-- Question Likes
INSERT INTO question_likes (question_id, user_id, created_at)
SELECT fq.id, u.id, NOW() - INTERVAL '2 days'
FROM forum_questions fq, users u
WHERE fq.title LIKE '%Operating Systems%' AND u.email IN ('karthik.venkat@rguktrkv.ac.in', 'anil.reddy@rguktrkv.ac.in')
ON CONFLICT DO NOTHING;

INSERT INTO question_likes (question_id, user_id, created_at)
SELECT fq.id, u.id, NOW() - INTERVAL '1 day'
FROM forum_questions fq, users u
WHERE fq.title LIKE '%product-based companies%' AND u.email IN ('rajesh.kumar@rguktrkv.ac.in', 'karthik.venkat@rguktrkv.ac.in', 'priya.sharma@rguktrkv.ac.in')
ON CONFLICT DO NOTHING;
-- Connections for rajesh.kumar (student1)
INSERT INTO connections (user_id, connected_user_id, status, created_at)
SELECT u1.id, u2.id, 'connected', NOW() - INTERVAL '10 days'
FROM users u1, users u2
WHERE u1.email='rajesh.kumar@rguktrkv.ac.in' AND u2.email='arjun.mehta@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO connections (user_id, connected_user_id, status, created_at)
SELECT u1.id, u2.id, 'connected', NOW() - INTERVAL '7 days'
FROM users u1, users u2
WHERE u1.email='rajesh.kumar@rguktrkv.ac.in' AND u2.email='divya.singh@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO connections (user_id, connected_user_id, status, created_at)
SELECT u1.id, u2.id, 'connected', NOW() - INTERVAL '5 days'
FROM users u1, users u2
WHERE u1.email='rajesh.kumar@rguktrkv.ac.in' AND u2.email='sanjay.gupta@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO connections (user_id, connected_user_id, status, created_at)
SELECT u1.id, u2.id, 'connected', NOW() - INTERVAL '3 days'
FROM users u1, users u2
WHERE u1.email='rajesh.kumar@rguktrkv.ac.in' AND u2.email='meera.reddy@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO connections (user_id, connected_user_id, status, created_at)
SELECT u1.id, u2.id, 'connected', NOW() - INTERVAL '2 days'
FROM users u1, users u2
WHERE u1.email='rajesh.kumar@rguktrkv.ac.in' AND u2.email='karthik.venkat@rguktrkv.ac.in'
ON CONFLICT DO NOTHING;

-- Messages between rajesh.kumar and arjun.mehta
INSERT INTO messages (sender_id, receiver_id, content, created_at)
SELECT u1.id, u2.id, 'Hi Arjun! I saw your insight about Google interview. It was really helpful!', NOW() - INTERVAL '2 days'
FROM users u1, users u2
WHERE u1.email='rajesh.kumar@rguktrkv.ac.in' AND u2.email='arjun.mehta@gmail.com';

INSERT INTO messages (sender_id, receiver_id, content, created_at)
SELECT u1.id, u2.id, 'Hey Rajesh! Glad you found it useful. Happy to help with any questions you have.', NOW() - INTERVAL '2 days' + INTERVAL '15 minutes'
FROM users u1, users u2
WHERE u1.email='arjun.mehta@gmail.com' AND u2.email='rajesh.kumar@rguktrkv.ac.in';

INSERT INTO messages (sender_id, receiver_id, content, created_at)
SELECT u1.id, u2.id, 'Thanks! I wanted to ask about system design preparation. When should I start focusing on it?', NOW() - INTERVAL '2 days' + INTERVAL '30 minutes'
FROM users u1, users u2
WHERE u1.email='rajesh.kumar@rguktrkv.ac.in' AND u2.email='arjun.mehta@gmail.com';

INSERT INTO messages (sender_id, receiver_id, content, created_at)
SELECT u1.id, u2.id, 'Start now! Even in E3, understanding basic system design helps. Begin with Grokking the System Design Interview course.', NOW() - INTERVAL '1 day'
FROM users u1, users u2
WHERE u1.email='arjun.mehta@gmail.com' AND u2.email='rajesh.kumar@rguktrkv.ac.in';

-- Messages between rajesh.kumar and divya.singh
INSERT INTO messages (sender_id, receiver_id, content, created_at)
SELECT u1.id, u2.id, 'Hi Divya! Your transition to data science is inspiring. Can we discuss your journey?', NOW() - INTERVAL '1 day'
FROM users u1, users u2
WHERE u1.email='rajesh.kumar@rguktrkv.ac.in' AND u2.email='divya.singh@gmail.com';

INSERT INTO messages (sender_id, receiver_id, content, created_at)
SELECT u1.id, u2.id, 'Of course! I would be happy to share my experience. When are you free for a call?', NOW() - INTERVAL '1 day' + INTERVAL '20 minutes'
FROM users u1, users u2
WHERE u1.email='divya.singh@gmail.com' AND u2.email='rajesh.kumar@rguktrkv.ac.in';

-- Messages between rajesh.kumar and karthik.venkat
INSERT INTO messages (sender_id, receiver_id, content, created_at)
SELECT u1.id, u2.id, 'Hey Karthik! Working on any interesting ML projects?', NOW() - INTERVAL '5 hours'
FROM users u1, users u2
WHERE u1.email='rajesh.kumar@rguktrkv.ac.in' AND u2.email='karthik.venkat@rguktrkv.ac.in';

INSERT INTO messages (sender_id, receiver_id, content, created_at)
SELECT u1.id, u2.id, 'Yes! Building an image classification model for plant disease detection. Want to collaborate?', NOW() - INTERVAL '4 hours'
FROM users u1, users u2
WHERE u1.email='karthik.venkat@rguktrkv.ac.in' AND u2.email='rajesh.kumar@rguktrkv.ac.in';

INSERT INTO messages (sender_id, receiver_id, content, created_at)
SELECT u1.id, u2.id, 'That sounds awesome! Count me in. Let''s discuss the tech stack.', NOW() - INTERVAL '3 hours'
FROM users u1, users u2
WHERE u1.email='rajesh.kumar@rguktrkv.ac.in' AND u2.email='karthik.venkat@rguktrkv.ac.in';