console.log(cards);
console.log(addCard({
    name: "Rahul Singh",
    title: "Developer",
    company: "TechWorld",
    email: "rahul@example.com",
    phone: "9999999999",
    website: "www.techworld.com",
    location: "India",
    template: "classic",
    color: "burgundy",
    status: "draft"
}));

console.log(searchCards("TechNova"));
console.log(countByStatus("approved"));
console.log(updateStatus(2, "approved"));
console.log(editCard(1, { company: "Google" }));
console.log(deleteCard(3));