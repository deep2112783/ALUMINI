-- Fix duplicate communities and add unique constraint

-- Step 1: Delete all existing communities and related data
DELETE FROM forum_answers 
WHERE question_id IN (SELECT id FROM forum_questions WHERE community_id IN (SELECT id FROM communities));

DELETE FROM forum_questions WHERE community_id IN (SELECT id FROM communities);

DELETE FROM community_members;

DELETE FROM communities;

-- Step 2: Add unique constraint on community name (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'communities_name_unique'
    ) THEN
        ALTER TABLE communities ADD CONSTRAINT communities_name_unique UNIQUE (name);
    END IF;
END $$;

-- Step 3: Insert multiple communities
INSERT INTO communities (name, domain, description) VALUES 
  ('Web Development', 'Technology', 'Learn and discuss modern web development - React, Node.js, Angular, Vue.js, and more.'),
  ('Data Science & Machine Learning', 'Technology', 'Explore ML algorithms, AI applications, data analysis, and predictive modeling.'),
  ('Mobile App Development', 'Technology', 'Android, iOS, Flutter, React Native - everything mobile development.'),
  ('Career & Placements', 'Career', 'Job opportunities, interview preparation, resume tips, and placement experiences.'),
  ('Competitive Programming', 'Technology', 'DSA, coding contests, LeetCode, CodeForces, and interview prep.'),
  ('Entrepreneurship & Startups', 'Business', 'Discuss startup ideas, business strategies, and entrepreneurial journeys.'),
  ('Cloud & DevOps', 'Technology', 'AWS, Azure, Docker, Kubernetes, CI/CD, and cloud architecture.'),
  ('Design & UI/UX', 'Design', 'UI design, UX research, Figma, prototyping, and user experience best practices.');

-- Step 4: Add members to communities
INSERT INTO community_members (user_id, community_id, joined_at)
SELECT u.id, c.id, NOW() - INTERVAL '10 days'
FROM users u, communities c
WHERE u.email='rajesh.kumar@rguktrkv.ac.in' AND c.name IN ('Web Development', 'Competitive Programming', 'Career & Placements');

INSERT INTO community_members (user_id, community_id, joined_at)
SELECT u.id, c.id, NOW() - INTERVAL '8 days'
FROM users u, communities c
WHERE u.email='priya.sharma@rguktrkv.ac.in' AND c.name IN ('Mobile App Development', 'Career & Placements');

INSERT INTO community_members (user_id, community_id, joined_at)
SELECT u.id, c.id, NOW() - INTERVAL '5 days'
FROM users u, communities c
WHERE u.email='karthik.venkat@rguktrkv.ac.in' AND c.name IN ('Data Science & Machine Learning', 'Competitive Programming');

INSERT INTO community_members (user_id, community_id, joined_at)
SELECT u.id, c.id, NOW() - INTERVAL '15 days'
FROM users u, communities c
WHERE u.email='arjun.mehta@rguktrkv.ac.in' AND c.name IN ('Web Development', 'Career & Placements', 'Cloud & DevOps');

INSERT INTO community_members (user_id, community_id, joined_at)
SELECT u.id, c.id, NOW() - INTERVAL '12 days'
FROM users u, communities c
WHERE u.email='divya.singh@rguktrkv.ac.in' AND c.name IN ('Data Science & Machine Learning', 'Career & Placements');

INSERT INTO community_members (user_id, community_id, joined_at)
SELECT u.id, c.id, NOW() - INTERVAL '7 days'
FROM users u, communities c
WHERE u.email='anil.reddy@rguktrkv.ac.in' AND c.name IN ('Cloud & DevOps', 'Career & Placements', 'Web Development');

-- Step 5: Add forum questions
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
