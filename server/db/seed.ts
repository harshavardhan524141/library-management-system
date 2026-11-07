import bcrypt from 'bcryptjs';
import { db } from './database.ts';

export async function seedDatabase() {
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  if (userCount > 0) {
    // Already seeded
    return;
  }

  console.log('Seeding database with sample library data...');

  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('admin123', salt);
  const userHash = await bcrypt.hash('password123', salt);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, phone, role, status, profile_image, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
  `);

  const insertBook = db.prepare(`
    INSERT INTO books (title, author, isbn, category, publisher, publication_year, description, total_copies, available_copies, cover_image, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
  `);

  const insertTransaction = db.prepare(`
    INSERT INTO transactions (user_id, book_id, issue_date, due_date, return_date, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now', ?))
  `);

  const insertIssueRequest = db.prepare(`
    INSERT INTO issue_requests (user_id, book_id, request_date, status, approved_by, approved_at, rejection_reason)
    VALUES (?, ?, datetime('now', ?), ?, ?, ?, ?)
  `);

  const insertReturnRequest = db.prepare(`
    INSERT INTO return_requests (transaction_id, requested_date, status, processed_by, processed_at)
    VALUES (?, datetime('now', ?), ?, ?, ?)
  `);

  const insertFine = db.prepare(`
    INSERT INTO fines (transaction_id, overdue_days, amount, payment_status, paid_date, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now', ?))
  `);

  const seedTx = db.transaction(() => {
    // 1. Users
    // Admin (id 1)
    insertUser.run(
      'Dr. Evelyn Reed',
      'admin@university.edu',
      adminHash,
      '+1 (555) 234-5678',
      'admin',
      'active',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      '-30 days'
    );

    // User 2: Aarav Sharma
    insertUser.run(
      'Aarav Sharma',
      'aarav.sharma@university.edu',
      userHash,
      '+1 (555) 345-6789',
      'user',
      'active',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      '-25 days'
    );

    // User 3: Sarah Jenkins
    insertUser.run(
      'Sarah Jenkins',
      'sarah.j@university.edu',
      userHash,
      '+1 (555) 456-7890',
      'user',
      'active',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      '-20 days'
    );

    // User 4: Michael Chang
    insertUser.run(
      'Michael Chang',
      'm.chang@university.edu',
      userHash,
      '+1 (555) 567-8901',
      'user',
      'active',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      '-15 days'
    );

    // User 5: Ananya Iyer
    insertUser.run(
      'Ananya Iyer',
      'ananya.i@university.edu',
      userHash,
      '+1 (555) 678-9012',
      'user',
      'active',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      '-10 days'
    );

    // User 6: David Miller (deactivated member for testing user management)
    insertUser.run(
      'David Miller',
      'david.m@university.edu',
      userHash,
      '+1 (555) 789-0123',
      'user',
      'deactivated',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      '-5 days'
    );

    // 2. Books (22 rich books)
    const booksData = [
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        isbn: '978-0132350884',
        category: 'Programming',
        publisher: 'Prentice Hall',
        year: 2008,
        desc: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees.',
        total: 5,
        avail: 4,
        cover: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=400&auto=format&fit=crop&q=80'
      },
      {
        title: 'Introduction to Algorithms (CLRS)',
        author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
        isbn: '978-0262033848',
        category: 'Computer Science',
        publisher: 'MIT Press',
        year: 2009,
        desc: 'A comprehensive textbook covering modern algorithm design, analysis, and implementation.',
        total: 6,
        avail: 4,
        cover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&auto=format&fit=crop&q=80'
      },
      {
        title: 'Artificial Intelligence: A Modern Approach',
        author: 'Stuart Russell & Peter Norvig',
        isbn: '978-0136042594',
        category: 'Artificial Intelligence',
        publisher: 'Pearson',
        year: 2020,
        desc: 'The authoritative, most widely used introduction to the theory and practice of artificial intelligence.',
        total: 4,
        avail: 3,
        cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80'
      },
      {
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        isbn: '978-1449373320',
        category: 'Computer Science',
        publisher: "O'Reilly Media",
        year: 2017,
        desc: 'The definitive guide to principles and architectures of high-reliability, distributed data systems.',
        total: 5,
        avail: 4,
        cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'
      },
      {
        title: 'Deep Learning',
        author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
        isbn: '978-0262035613',
        category: 'Artificial Intelligence',
        publisher: 'MIT Press',
        year: 2016,
        desc: 'Comprehensive reference text on mathematical principles, neural networks, and deep learning algorithms.',
        total: 3,
        avail: 2,
        cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80'
      },
      {
        title: 'Structure and Interpretation of Computer Programs',
        author: 'Harold Abelson & Gerald Jay Sussman',
        isbn: '978-0262510875',
        category: 'Computer Science',
        publisher: 'MIT Press',
        year: 1996,
        desc: 'Foundational computer science classic examining abstraction, modularity, and programming languages.',
        total: 3,
        avail: 3,
        cover: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80'
      },
      {
        title: 'Linear Algebra and Its Applications',
        author: 'Gilbert Strang',
        isbn: '978-0030105678',
        category: 'Mathematics',
        publisher: 'Cengage Learning',
        year: 2006,
        desc: 'Renowned text introducing vector spaces, eigenvalues, linear transformations, and applications.',
        total: 4,
        avail: 3,
        cover: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&auto=format&fit=crop&q=80'
      },
      {
        title: 'The Pragmatic Programmer: Your Journey To Mastery',
        author: 'David Thomas & Andrew Hunt',
        isbn: '978-0135957059',
        category: 'Programming',
        publisher: 'Addison-Wesley',
        year: 2019,
        desc: 'Practical techniques and core philosophies for producing maintainable, robust, and delightful software.',
        total: 4,
        avail: 3,
        cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80'
      },
      {
        title: 'Computer Networking: A Top-Down Approach',
        author: 'James Kurose & Keith Ross',
        isbn: '978-0133594140',
        category: 'Computer Science',
        publisher: 'Pearson',
        year: 2021,
        desc: 'Top-down exploration of modern networking protocols from the application layer to the physical layer.',
        total: 4,
        avail: 4,
        cover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=80'
      },
      {
        title: 'Operating System Concepts (Dinosaur Book)',
        author: 'Abraham Silberschatz, Peter Baer Galvin, Greg Gagne',
        isbn: '978-1118063330',
        category: 'Computer Science',
        publisher: 'Wiley',
        year: 2018,
        desc: 'The leading foundational text on processes, concurrency, memory management, and file systems.',
        total: 5,
        avail: 4,
        cover: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&auto=format&fit=crop&q=80'
      },
      {
        title: 'Database System Concepts',
        author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
        isbn: '978-0078022159',
        category: 'Computer Science',
        publisher: 'McGraw-Hill',
        year: 2019,
        desc: 'Core database concepts covering relational models, SQL, transactions, query optimization, and storage.',
        total: 4,
        avail: 4,
        cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80'
      },
      {
        title: 'Calculus: Early Transcendentals',
        author: 'James Stewart',
        isbn: '978-1285741550',
        category: 'Mathematics',
        publisher: 'Cengage Learning',
        year: 2015,
        desc: 'Renowned for mathematical precision, accuracy, and outstanding problem sets for university students.',
        total: 3,
        avail: 2,
        cover: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400&auto=format&fit=crop&q=80'
      },
      {
        title: 'Pattern Recognition and Machine Learning',
        author: 'Christopher M. Bishop',
        isbn: '978-0387310732',
        category: 'Artificial Intelligence',
        publisher: 'Springer',
        year: 2006,
        desc: 'Comprehensive Bayesian treatment of statistical pattern recognition and machine learning techniques.',
        total: 3,
        avail: 3,
        cover: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&auto=format&fit=crop&q=80'
      },
      {
        title: 'Quantum Mechanics: The Theoretical Minimum',
        author: 'Leonard Susskind & Art Friedman',
        isbn: '978-0465062904',
        category: 'Science',
        publisher: 'Basic Books',
        year: 2014,
        desc: 'An accessible yet rigorous journey into quantum theory, state vectors, entanglement, and spin.',
        total: 2,
        avail: 1,
        cover: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=400&auto=format&fit=crop&q=80'
      },
      {
        title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
        author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides (GoF)',
        isbn: '978-0201633610',
        category: 'Programming',
        publisher: 'Addison-Wesley',
        year: 1994,
        desc: 'The seminal catalog of 23 classic software design patterns and object-oriented architectural wisdom.',
        total: 4,
        avail: 3,
        cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&auto=format&fit=crop&q=80'
      },
      {
        title: 'Reinforcement Learning: An Introduction',
        author: 'Richard S. Sutton & Andrew G. Barto',
        isbn: '978-0262039246',
        category: 'Artificial Intelligence',
        publisher: 'MIT Press',
        year: 2018,
        desc: 'Clear and comprehensive account of reinforcement learning algorithms, MDPs, and value functions.',
        total: 2,
        avail: 2,
        cover: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&auto=format&fit=crop&q=80'
      },
      {
        title: 'Cracking the Coding Interview',
        author: 'Gayle Laakmann McDowell',
        isbn: '978-0984782857',
        category: 'Programming',
        publisher: 'CareerCup',
        year: 2015,
        desc: '189 programming questions and solutions covering data structures, algorithms, and technical interviews.',
        total: 5,
        avail: 3,
        cover: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&auto=format&fit=crop&q=80'
      },
      {
        title: 'Introduction to Probability Models',
        author: 'Sheldon M. Ross',
        isbn: '978-0128143469',
        category: 'Mathematics',
        publisher: 'Academic Press',
        year: 2019,
        desc: 'Classic introduction to stochastic processes, Markov chains, Poisson processes, and reliability theory.',
        total: 3,
        avail: 2,
        cover: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80'
      },
      {
        title: 'Computer Organization and Design (RISC-V Edition)',
        author: 'David A. Patterson & John L. Hennessy',
        isbn: '978-0128122754',
        category: 'Computer Science',
        publisher: 'Morgan Kaufmann',
        year: 2017,
        desc: 'Hardware/software interface guide examining pipelining, processor caches, and RISC-V architecture.',
        total: 3,
        avail: 3,
        cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80'
      },
      {
        title: 'Brief Answers to the Big Questions',
        author: 'Stephen Hawking',
        isbn: '978-1984819192',
        category: 'Science',
        publisher: 'Bantam Books',
        year: 2018,
        desc: 'Profound reflections on the origin of the universe, black holes, time travel, and human destiny.',
        total: 4,
        avail: 4,
        cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80'
      },
      {
        title: 'Compilers: Principles, Techniques, and Tools (Dragon Book)',
        author: 'Alfred V. Aho, Monica S. Lam, Ravi Sethi, Jeffrey D. Ullman',
        isbn: '978-0321486813',
        category: 'Computer Science',
        publisher: 'Addison-Wesley',
        year: 2006,
        desc: 'The definitive text on lexical analysis, parsing, semantic analysis, syntax-directed translation, and code generation.',
        total: 2,
        avail: 2,
        cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'
      },
      {
        title: 'Discrete Mathematics and Its Applications',
        author: 'Kenneth H. Rosen',
        isbn: '978-1259676512',
        category: 'Mathematics',
        publisher: 'McGraw-Hill',
        year: 2018,
        desc: 'Mathematical reasoning, combinatorics, graph theory, sets, relations, and propositional logic.',
        total: 4,
        avail: 3,
        cover: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&auto=format&fit=crop&q=80'
      }
    ];

    let bIdx = 0;
    for (const b of booksData) {
      bIdx++;
      insertBook.run(
        b.title,
        b.author,
        b.isbn,
        b.category,
        b.publisher,
        b.year,
        b.desc,
        b.total,
        b.avail,
        b.cover,
        `-${30 - bIdx} days`
      );
    }

    // 3. Transactions
    // User 2 (Aarav):
    // Tx 1: Clean Code (Book 1) - Issued on -7 days, due +7 days
    insertTransaction.run(2, 1, '2026-10-25', '2026-11-08', null, 'Issued', '-7 days');

    // Tx 2: CLRS (Book 2) - Issued on -12 days, due +2 days
    insertTransaction.run(2, 2, '2026-10-20', '2026-11-03', null, 'Issued', '-12 days');

    // User 3 (Sarah):
    // Tx 3: Designing Data-Intensive Applications (Book 4) - Issued -20 days, due -6 days, RETURN REQUESTED!
    insertTransaction.run(3, 4, '2026-10-12', '2026-10-26', null, 'Return Requested', '-20 days');

    // Tx 4: Deep Learning (Book 5) - Issued on -5 days, due +9 days
    insertTransaction.run(3, 5, '2026-10-27', '2026-11-10', null, 'Issued', '-5 days');

    // User 4 (Michael):
    // Tx 5: Calculus (Book 12) - Issued -25 days, due -11 days, OVERDUE!
    insertTransaction.run(4, 12, '2026-10-07', '2026-10-21', null, 'Overdue', '-25 days');

    // Tx 6: Pragmatic Programmer (Book 8) - Issued -30 days, returned on -10 days (Returned, Paid fine)
    insertTransaction.run(4, 8, '2026-10-02', '2026-10-16', '2026-10-22', 'Returned', '-30 days');

    // User 5 (Ananya):
    // Tx 7: Cracking Coding Interview (Book 17) - Issued -18 days, returned on -4 days
    insertTransaction.run(5, 17, '2026-10-14', '2026-10-28', '2026-10-28', 'Returned', '-18 days');

    // Tx 8: Cracking Coding Interview (Book 17) - Issued -4 days, due +10 days
    insertTransaction.run(5, 17, '2026-10-28', '2026-11-11', null, 'Issued', '-4 days');

    // 4. Return Request for Tx 3
    insertReturnRequest.run(3, '-1 days', 'Pending', null, null);

    // 5. Issue Requests
    // Request 1: User 3 (Sarah) requested Book 3 (AI: Modern Approach) -> Pending
    insertIssueRequest.run(3, 3, '-1 days', 'Pending', null, null, null);

    // Request 2: User 5 (Ananya) requested Book 7 (Linear Algebra) -> Pending
    insertIssueRequest.run(5, 7, '-2 days', 'Pending', null, null, null);

    // Request 3: User 4 (Michael) requested Book 14 (Quantum Mechanics) -> Approved
    insertIssueRequest.run(4, 14, '-10 days', 'Approved', 1, '2026-10-22', null);

    // 6. Fines
    // Fine 1: Tx 5 (Michael's Calculus, 11 days overdue as of Nov 1)
    // 11 days * 5 = 55 INR. Status: Unpaid
    insertFine.run(5, 11, 55.0, 'Unpaid', null, '-1 days');

    // Fine 2: Tx 6 (Michael's Pragmatic Programmer, was 6 days overdue when returned on Oct 22)
    // 6 days * 5 = 30 INR. Status: Paid
    insertFine.run(6, 6, 30.0, 'Paid', '2026-10-22', '-10 days');
  });

  seedTx();
  console.log('Database seeded successfully!');
}
