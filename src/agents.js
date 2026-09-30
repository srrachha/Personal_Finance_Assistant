const money = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);

export function runBudgetAgent(financeData) {
  const spent = financeData.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const remaining = financeData.budget - spent;
  const usedPercent = financeData.budget > 0 ? Math.round((spent / financeData.budget) * 100) : 0;

  return {
    agent: 'Budget Agent',
    status: remaining >= 0 ? 'On track' : 'Over budget',
    spent,
    budget: financeData.budget,
    remaining,
    usedPercent,
    message: remaining >= 0
      ? `You have ${money(remaining)} left in your monthly budget.`
      : `You are ${money(Math.abs(remaining))} over your monthly budget.`
  };
}

export function runCashFlowAgent(financeData) {
  const spent = financeData.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const netCashFlow = financeData.income - spent;

  return {
    agent: 'Cash Flow Agent',
    status: netCashFlow >= 0 ? 'Positive flow' : 'Negative flow',
    income: financeData.income,
    expenses: spent,
    netCashFlow,
    message: netCashFlow >= 0
      ? `You have ${money(netCashFlow)} remaining after listed expenses.`
      : `Your listed expenses exceed income by ${money(Math.abs(netCashFlow))}.`
  };
}

export function runSavingsAgent(financeData) {
  const spent = financeData.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const savings = financeData.income - spent;
  const savingsRate = financeData.income > 0 ? (savings / financeData.income) * 100 : 0;
  const target = financeData.income * 0.2;

  return {
    agent: 'Savings Agent',
    status: savingsRate >= 20 ? 'Target reached' : 'Below target',
    savings,
    savingsRate: Math.round(savingsRate),
    target,
    gap: Math.max(0, target - savings),
    message: savingsRate >= 20
      ? `You are meeting the 20% savings target.`
      : `Aim to save another ${money(Math.max(0, target - savings))} to reach the 20% target.`
  };
}

export function runFinanceAgents(financeData) {
  const budget = runBudgetAgent(financeData);
  const cashFlow = runCashFlowAgent(financeData);
  const savings = runSavingsAgent(financeData);

  // Coordinator combines the three specialist-agent results.
  const recommendations = [];
  if (budget.remaining < 0) {
    recommendations.push('Reduce or pause non-essential spending to bring expenses back within budget.');
  } else if (budget.usedPercent >= 80) {
    recommendations.push('You have used most of your budget. Check remaining planned expenses before spending more.');
  } else {
    recommendations.push('Keep tracking expenses by category so you can spot changes early.');
  }

  if (cashFlow.netCashFlow < 0) {
    recommendations.push('Review recurring expenses and prioritise essentials until cash flow is positive.');
  } else {
    recommendations.push('Keep some cash available for upcoming bills and unexpected expenses.');
  }

  if (savings.savingsRate < 20) {
    recommendations.push('Try setting aside a small amount on payday and gradually work toward saving 20% of income.');
  } else {
    recommendations.push('Continue your savings habit and consider keeping emergency savings separate.');
  }

  return { budget, cashFlow, savings, recommendations };
}
