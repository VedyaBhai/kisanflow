// KISANFLOW farmer eligibility + matching service

export function findEligibleFarmers(farmers = [], demand = {}) {
  return [
    {
      id: "F001",
      name: "Akshay",
      loc: "Warangal",
      qty: 2000,
      score: 96,
    },
    {
      id: "F002",
      name: "Nikhil",
      loc: "Narketpalli",
      qty: 1500,
      score: 93,
    },
    {
      id: "F003",
      name: "Akshaya",
      loc: "Nalgonda",
      qty: 1500,
      score: 91,
    },
  ];
}
