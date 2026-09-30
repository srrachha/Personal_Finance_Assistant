import { useMemo, useState } from 'react';
import { runFinanceAgents } from './agents.js';

const initialExpenses = [
  { id: 1, category: 'Groceries', amount: 4000, icon: '🛒' },
  { id: 2, category: 'Transport', amount: 2500, icon: '🚌' },
  { id: 3, category: 'Food & coffee', amount: 1500, icon: '☕' }
];

const formatMoney = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);

function StatCard({ label, value, note, icon, tone = '' }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className={`stat-icon ${tone}`}>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </article>
  );
}

function AgentCard({ number, title, subtitle, status, message, icon }) {
  return (
    <article className="agent-card">
      <div className="agent-heading">
        <div className="agent-icon">{icon}</div>
        <div className="agent-title-wrap">
          <span className="agent-number">AGENT 0{number}</span>
          <h3>{title}</h3>
        </div>
        <span className="status-pill">{status}</span>
      </div>
      <p className="agent-subtitle">{subtitle}</p>
      <p className="agent-message">{message}</p>
    </article>
  );
}

export default function App() {
  const [income, setIncome] = useState(20000);
  const [budget, setBudget] = useState(12000);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [category, setCategory] = useState('Shopping');
  const [amount, setAmount] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, role: 'bot', text: 'Hi Sharayu! I’m FinMate Assistant. Ask me about your current budget, expenses, cash flow, savings, or ways to reduce spending. I use the live figures shown on this dashboard.' }
  ]);

  const financeData = useMemo(() => ({ income: Number(income), budget: Number(budget), expenses }), [income, budget, expenses]);
  const results = useMemo(() => runFinanceAgents(financeData), [financeData]);
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const budgetProgress = budget > 0 ? Math.min(100, Math.max(0, (totalExpenses / budget) * 100)) : 0;

  function addExpense(event) {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
    const icons = { Shopping: '🛍️', Health: '💊', Bills: '🧾', Entertainment: '🎬', Other: '📌' };
    setExpenses((current) => [
      ...current,
      { id: Date.now(), category, amount: parsedAmount, icon: icons[category] || '📌' }
    ]);
    setAmount('');
  }

  function removeExpense(id) {
    setExpenses((current) => current.filter((item) => item.id !== id));
  }

  function getChatbotReply(rawMessage) {
    const message = rawMessage.toLowerCase().trim();
    const spent = totalExpenses;
    const balance = Number(income) - spent;
    const remaining = Number(budget) - spent;
    const savingsRate = Number(income) > 0 ? (balance / Number(income)) * 100 : 0;
    const money = formatMoney;

    if (/\b(hi|hello|hey|good morning|good evening)\b/.test(message)) {
      return 'Hello! 👋 I can help you understand the live financial figures on your FinMate dashboard. Type “help” to see what you can ask.';
    }
    if (/\b(help|what can you do|examples|options)\b/.test(message)) {
      return 'You can ask me:\n• Summarize my finances\n• Am I over budget?\n• How much have I saved?\n• Show my cash flow\n• What is my savings rate?\n• How can I reduce expenses?\n• Which category costs the most?';
    }
    if (/\b(summary|summarize|overall|financial status|my finances)\b/.test(message)) {
      return `Here is your current dashboard summary:\n• Monthly income: ${money(Number(income))}\n• Expenses: ${money(spent)}\n• Available balance: ${money(balance)}\n• Monthly budget: ${money(Number(budget))}\n• Budget status: ${remaining >= 0 ? `${money(remaining)} remaining` : `${money(Math.abs(remaining))} over budget`}\n• Savings rate: ${savingsRate.toFixed(1)}%`;
    }
    if (/\b(over budget|budget|budget limit|remaining budget)\b/.test(message)) {
      if (remaining > 0) return `You have ${money(remaining)} remaining from your ${money(Number(budget))} budget. You have used ${Number(budget) > 0 ? Math.round(spent / Number(budget) * 100) : 0}% of it.`;
      if (remaining < 0) return `You are ${money(Math.abs(remaining))} over your ${money(Number(budget))} budget. Consider pausing non-essential purchases and reviewing your expense list.`;
      return `You have used your full budget of ${money(Number(budget))}. Check planned expenses before spending more.`;
    }
    if (/\b(savings rate|percentage saved|save percentage)\b/.test(message)) {
      return `Your estimated savings rate is ${savingsRate.toFixed(1)}%. That is based on income of ${money(Number(income))} minus listed expenses of ${money(spent)}. The dashboard uses 20% of income as a reference target.`;
    }
    if (/\b(save|saved|savings|left over|leftover|surplus)\b/.test(message)) {
      return balance >= 0 ? `Your estimated balance after listed expenses is ${money(balance)} (a savings rate of ${savingsRate.toFixed(1)}%). This assumes all income and expenses for the period have been entered.` : `Your listed expenses exceed your income by ${money(Math.abs(balance))}. Review expenses and prioritize essential payments.`;
    }
    if (/\b(cash flow|income|expenses|spending|spent|expense)\b/.test(message)) {
      const biggest = [...expenses].sort((a, b) => Number(b.amount) - Number(a.amount))[0];
      return `Your current cash flow:\n• Income: ${money(Number(income))}\n• Listed expenses: ${money(spent)}\n• Balance: ${money(balance)}\n${biggest ? `Your largest listed expense is ${biggest.category} (${money(Number(biggest.amount))}).` : 'You have not added any expenses yet.'}`;
    }
    if (/\b(category|categories|largest|highest|most)\b/.test(message)) {
      if (!expenses.length) return 'There are no expenses listed yet. Add expenses in the Recent expenses section and ask me again.';
      const totals = expenses.reduce((acc, item) => { acc[item.category] = (acc[item.category] || 0) + Number(item.amount || 0); return acc; }, {});
      const [name, value] = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
      return `Your highest-spending category among the listed expenses is ${name}, totaling ${money(value)}.`;
    }
    if (/\b(reduce|cut|lower|control|manage).*(expense|spending|cost)|\b(save money|spend less|reduce expenses)\b/.test(message)) {
      return 'A few practical ideas:\n1. Review the expense categories and start with the largest flexible cost.\n2. Set a weekly spending limit.\n3. Plan shopping and meals before buying.\n4. Check recurring payments and subscriptions.\n5. Add expenses regularly so the dashboard stays useful.\nChoose changes that fit your needs; do not skip essentials.';
    }
    if (/\b(50.?30.?20|rule of 50|budgeting rule)\b/.test(message)) {
      return `The 50/30/20 guideline suggests allocating after-tax income to needs (50%), wants (30%), and savings or debt repayment (20%). For your entered income of ${money(Number(income))}, those reference amounts are ${money(Number(income) * 0.5)}, ${money(Number(income) * 0.3)}, and ${money(Number(income) * 0.2)} respectively. It is a flexible guideline, not a strict rule.`;
    }
    if (/\b(thanks|thank you)\b/.test(message)) return 'You’re welcome! 😊 Ask me whenever you want to check your budget, expenses, cash flow, or savings.';
    return 'I didn’t find a matching rule for that question yet. Try asking about your finances, budget, savings, cash flow, expense categories, or type “help”.';
  }

  function sendChatMessage(event) {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    const reply = getChatbotReply(text);
    setChatMessages((current) => [...current, { id: Date.now(), role: 'user', text }, { id: Date.now() + 1, role: 'bot', text: reply }]);
    setChatInput('');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">F</div>
          <div><strong>FinMate</strong><span>PERSONAL FINANCE</span></div>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav className="nav-list" aria-label="Main navigation">
          <a className="nav-item active" href="#overview"><span>▦</span> Overview</a>
          <a className="nav-item" href="#expenses"><span>↗</span> Expenses</a>
          <a className="nav-item" href="#agents"><span>✳</span> AI Agents</a>
          <a className="nav-item" href="#recommendations"><span>♧</span> Insights</a>
          <a className="nav-item" href="#chatbot"><span>☏</span> Chatbot</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">✦</div>
            <strong>Your money, in focus.</strong>
            <p>Four finance agents working together to help you understand your month.</p>
          </div>
          <div className="profile">
            <div className="avatar">S</div>
            <div><strong>My workspace</strong><span>Personal account</span></div>
            <span className="profile-dots">•••</span>
          </div>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div>
          <div className="topbar-right"><span className="live-dot"></span><span>Demo data</span><div className="top-avatar">S</div></div>
        </header>

        <section className="page-intro">
          <div>
            <div className="eyebrow"><span className="sparkle">✦</span> YOUR FINANCIAL SNAPSHOT</div>
            <h1>Good morning, Sharayu <span className="wave">✳</span></h1>
            <p>Here’s how your money is looking this month.</p>
          </div>
          <div className="month-chip"><span>◷</span> Monthly overview</div>
        </section>

        <section className="stats-grid" aria-label="Financial summary">
          <StatCard label="Monthly income" value={formatMoney(Number(income))} note="Your expected income" icon="↘" tone="green" />
          <StatCard label="Total expenses" value={formatMoney(totalExpenses)} note={`${expenses.length} expense entries`} icon="↗" tone="orange" />
          <StatCard label="Available balance" value={formatMoney(Number(income) - totalExpenses)} note="Income minus expenses" icon="◈" tone="purple" />
          <StatCard label="Savings rate" value={`${results.savings.savingsRate}%`} note="Target: 20% of income" icon="✳" tone="blue" />
        </section>

        <section className="content-grid">
          <article className="panel budget-panel">
            <div className="panel-header">
              <div><span className="section-kicker">SPENDING CONTROL</span><h2>Monthly budget</h2></div>
              <span className={`mini-status ${results.budget.remaining >= 0 ? 'good' : 'bad'}`}>{results.budget.status}</span>
            </div>
            <div className="budget-numbers">
              <div><strong>{formatMoney(totalExpenses)}</strong><span>Spent so far</span></div>
              <div className="budget-limit"><strong>{formatMoney(Number(budget))}</strong><span>Monthly limit</span></div>
            </div>
            <div className="progress-track"><div className={`progress-fill ${totalExpenses > budget ? 'over' : ''}`} style={{ width: `${budgetProgress}%` }} /></div>
            <div className="progress-labels"><span>{Math.round((budget > 0 ? totalExpenses / budget : 0) * 100)}% used</span><span>{formatMoney(Number(budget) - totalExpenses)} {totalExpenses <= budget ? 'left' : 'over'}</span></div>
            <div className="edit-fields">
              <label>Monthly income (₹)<input type="number" min="0" value={income} onChange={(e) => setIncome(e.target.value)} /></label>
              <label>Budget limit (₹)<input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} /></label>
            </div>
          </article>

          <article className="panel cash-panel">
            <div className="panel-header">
              <div><span className="section-kicker">CASH FLOW</span><h2>Where you stand</h2></div>
              <div className="cash-icon">₹</div>
            </div>
            <div className="cash-total">{formatMoney(Number(income) - totalExpenses)}</div>
            <p className="muted">Estimated balance after listed expenses</p>
            <div className="cash-breakdown">
              <div><span><i className="legend-dot income-dot"></i>Income</span><strong>{formatMoney(Number(income))}</strong></div>
              <div><span><i className="legend-dot expense-dot"></i>Expenses</span><strong>{formatMoney(totalExpenses)}</strong></div>
            </div>
            <div className="cash-foot"><span className="live-dot"></span>{results.cashFlow.status}</div>
          </article>
        </section>

        <section className="lower-grid">
          <article className="panel expenses-panel" id="expenses">
            <div className="panel-header">
              <div><span className="section-kicker">YOUR TRANSACTIONS</span><h2>Recent expenses</h2></div>
              <span className="count-badge">{expenses.length} items</span>
            </div>
            <form className="add-expense-form" onSubmit={addExpense}>
              <label className="sr-only" htmlFor="expense-category">Category</label>
              <select id="expense-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Shopping</option><option>Health</option><option>Bills</option><option>Entertainment</option><option>Other</option>
              </select>
              <label className="sr-only" htmlFor="expense-amount">Amount</label>
              <input id="expense-amount" type="number" min="1" placeholder="Amount in ₹" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              <button type="submit">+ Add</button>
            </form>
            <div className="expense-list">
              {expenses.length === 0 ? <p className="empty-state">No expenses yet. Add one above to get started.</p> : expenses.map((item) => (
                <div className="expense-row" key={item.id}>
                  <div className="expense-category-icon">{item.icon}</div>
                  <div className="expense-name"><strong>{item.category}</strong><span>Monthly expense</span></div>
                  <strong className="expense-amount">−{formatMoney(Number(item.amount))}</strong>
                  <button className="remove-button" type="button" onClick={() => removeExpense(item.id)} aria-label={`Remove ${item.category} expense`}>×</button>
                </div>
              ))}
            </div>
          </article>

          <article className="panel savings-panel">
            <div className="panel-header">
              <div><span className="section-kicker">SAVINGS GOAL</span><h2>Build your cushion</h2></div>
              <div className="savings-icon">✧</div>
            </div>
            <div className="savings-ring-wrap">
              <div className="savings-ring" style={{ '--progress': `${Math.max(0, Math.min(100, results.savings.savingsRate))}%` }}>
                <div><strong>{results.savings.savingsRate}%</strong><span>savings rate</span></div>
              </div>
            </div>
            <div className="savings-goal-row"><span>Monthly target</span><strong>{formatMoney(Number(income) * 0.2)}</strong></div>
            <div className="savings-goal-row"><span>Current estimated savings</span><strong>{formatMoney(Number(income) - totalExpenses)}</strong></div>
            <p className="savings-note">{results.savings.message}</p>
          </article>
        </section>

        <section className="agents-section" id="agents">
          <div className="section-heading">
            <div><span className="section-kicker">MULTI-AGENT WORKSPACE</span><h2>Your finance agents</h2><p>Each specialist checks one part of your finances.</p></div>
            <span className="coordinator-badge"><span className="live-dot"></span> Coordinator active</span>
          </div>
          <div className="agents-grid">
            <AgentCard number="1" title="Budget Agent" subtitle="Spending vs. budget" status={results.budget.status} message={results.budget.message} icon="◫" />
            <AgentCard number="2" title="Cash Flow Agent" subtitle="Income vs. expenses" status={results.cashFlow.status} message={results.cashFlow.message} icon="↗" />
            <AgentCard number="3" title="Savings Agent" subtitle="Savings goal tracking" status={results.savings.status} message={results.savings.message} icon="✧" />
          </div>
          <div className="advisor-card" id="recommendations">
            <div className="advisor-top">
              <div className="advisor-icon">✦</div>
              <div><span className="agent-number">AGENT 04 · COORDINATOR</span><h3>Financial Advisor</h3><p>Combines insights from all three agents into practical next steps.</p></div>
            </div>
            <div className="recommendations-list">
              {results.recommendations.map((recommendation, index) => (
                <div className="recommendation" key={recommendation}><span className="recommendation-number">0{index + 1}</span><span>{recommendation}</span></div>
              ))}
            </div>
            <p className="demo-note">Demo note: These recommendations use simple JavaScript rules and calculations. No external AI API is connected.</p>
          </div>
        </section>

        <section className="chatbot-section" id="chatbot">
          <div className="section-heading">
            <div><span className="section-kicker">FINANCIAL ASSISTANT</span><h2>Chat with FinMate</h2><p>Ask questions about the live figures in your dashboard.</p></div>
            <span className="coordinator-badge"><span className="live-dot"></span> Rule-based chatbot</span>
          </div>
          <div className="chatbot-panel">
            <div className="chatbot-topline"><div className="chatbot-avatar">✦</div><div><strong>FinMate Assistant</strong><span>Uses your current dashboard data · No API key required</span></div><button type="button" className="chat-reset" onClick={() => setChatMessages([{ id: Date.now(), role: 'bot', text: 'Chat reset. Ask me about your current budget, expenses, cash flow, or savings.' }])}>New chat</button></div>
            <div className="chatbot-messages" aria-live="polite">
              {chatMessages.map((message) => <div className={`chat-message ${message.role}`} key={message.id}><span className="chat-message-label">{message.role === 'bot' ? 'FINMATE' : 'YOU'}</span><p>{message.text}</p></div>)}
            </div>
            <div className="chatbot-prompts">
              {['Summarize my finances', 'Am I over budget?', 'How much have I saved?', 'Which category costs the most?'].map((prompt) => <button type="button" key={prompt} onClick={() => { const reply = getChatbotReply(prompt); setChatMessages((current) => [...current, { id: Date.now(), role: 'user', text: prompt }, { id: Date.now() + 1, role: 'bot', text: reply }]); }}>{prompt}</button>)}
            </div>
            <form className="chatbot-composer" onSubmit={sendChatMessage}>
              <input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Ask about your finances..." aria-label="Ask FinMate a question" />
              <button type="submit" disabled={!chatInput.trim()}>Send <span>➤</span></button>
            </form>
            <p className="chatbot-disclaimer">Demo assistant: answers are generated from predefined JavaScript rules, not an LLM or professional financial advice.</p>
          </div>
        </section>

        <footer className="footer"><span>FinMate AI</span><span>Personal finance, made clearer.</span></footer>
      </main>
    </div>
  );
}
