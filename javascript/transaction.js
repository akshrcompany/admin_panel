import { auth, onAuthStateChanged, db, collection, getDocs } from "./config.js";

const TRANSACTIONS_PER_PAGE = 10; // Change per page as needed
let allTransactions = [];
let currentPage = 1;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const docRef = collection(db, "Transactions");
    const docSnap = await getDocs(docRef);
    if (docSnap.empty) {
      console.log("No transactions found.");
      return;
    }
    allTransactions = docSnap.docs.map(doc => ({
      ...doc.data(),
      id: doc.id // Include the document ID
    }));

    // --- SORT: Latest date at top ---
    allTransactions.sort((a, b) => {
      const dateA = a.paid_at?.toDate?.() || a.timestamp?.toDate?.() || new Date(a.date) || new Date(0);
      const dateB = b.paid_at?.toDate?.() || b.timestamp?.toDate?.() || new Date(b.date) || new Date(0);
      return dateB - dateA;
    });

    // Render first page
    renderTransactions(getPageData(currentPage));
    renderPagination();
  } else {
    window.location.href = "../login.html";
  }
});

function getPageData(page) {
  const start = (page - 1) * TRANSACTIONS_PER_PAGE;
  const end = start + TRANSACTIONS_PER_PAGE;
  return allTransactions.slice(start, end);
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  if (!pagination) return; // Add <div id="pagination"></div> in your HTML

  const totalPages = Math.ceil(allTransactions.length / TRANSACTIONS_PER_PAGE);
  pagination.innerHTML = "";

  // Prev button
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Prev";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderTransactions(getPageData(currentPage));
      renderPagination();
    }
  };
  pagination.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.disabled = true;
    btn.onclick = () => {
      currentPage = i;
      renderTransactions(getPageData(currentPage));
      renderPagination();
    };
    pagination.appendChild(btn);
  }

  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderTransactions(getPageData(currentPage));
      renderPagination();
    }
  };
  pagination.appendChild(nextBtn);
}

function renderTransactions(data = []) {
  const tbody = document.getElementById("transactionBody");
  tbody.innerHTML = ""; // Clear previous rows
  data.forEach(item => {
    // Handle Firestore Timestamp to date string
    let dateStr = "";
    if (item.paid_at && typeof item.paid_at.toDate === "function") {
      const d = item.paid_at.toDate();
      dateStr = d.toLocaleDateString();
    } else if (item.timestamp && typeof item.timestamp.toDate === "function") {
      const d = item.timestamp.toDate();
      dateStr = d.toLocaleDateString();
    } else if (item.date) {
      dateStr = new Date(item.date).toLocaleDateString();
    }

    // Status and icon logic
    let icon = item.status === "paid" || item.status === "Success" ? "✔" : "−";
    let statusText = item.status === "paid" ? "Success" : "Failed";
    let rowClass = icon === "✔" ? "tick-row" : "";

    // Transaction ID
    let id =  item.id || "";

    // Source
    let source = item.transactionDoneBy || item.source || "";

    // Amount
    let amount = item.amount || "";

    const row = document.createElement("tr");
    if (rowClass) row.classList.add(rowClass);
    row.innerHTML = `
      <td class="icon">${icon}</td>
      <td><a href='https://akshr.in/dashboard//invoice.html?tid=${id}'>${id}</a></td>
      <td>${dateStr}</td>
      <td>₹${amount/100}</td>
      <td>${source}</td>
      <td><span class="status-success">${statusText}</span></td>
    `;
    tbody.appendChild(row);
  });
}
