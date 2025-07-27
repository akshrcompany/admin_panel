import { auth, onAuthStateChanged, reff, updateDoc, onValue, dbd, doc, getDoc, db, collection, getDocs, signOut } from "./config.js";

var uid = null;
onAuthStateChanged(auth, async (user) => {
    if (user) {

        uid = user.uid;

        const docRef = collection(db, "service_requests");
        const docSnap = await getDocs(docRef);

        console.log("service requests found:", docSnap.docs.length);
        const transactions = [];

        console.log("Transactions found:", docSnap.docs[0].data());
        renderTransactions(docSnap.docs.map(doc => ({
            ...doc.data(),
            id: doc.id // Include the document ID
        })));

        // ...
    } else {
        // User is signed out
        // ...
        window.location.href = "../login.html";
    }
});




function renderTransactions(data) {
    const tbody = document.getElementById("transactionBody");
    tbody.innerHTML = ""; // Clear previous rows
    data.forEach(item => {
        console.log("Item:", item);
        // Handle Firestore Timestamp to date string
        if (item.createdAt && typeof item.createdAt.toDate === "function") {
            item.createAt = item.createdAt.toDate().toLocaleString();
        } else {
            item.createAt = item.createdAt || new Date().toLocaleString();
        }


        // Transaction ID
        let id = item.id || "";

        // Source
        let status = item.status || item.status || "pending";

        // Amount
        let amount = item.amount || "";

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><a>${item.createAt}</a></td>
            <td>${item.interest}</td>
            <td>${item.name}</td>

            <td><span class="status-success">${status}</span></td>
            <td><button class="view-btn" data-id='${item.id}'>View</button></td>
        `;

        // Add event listener to the "View" button
        row.querySelector('.view-btn').addEventListener('click', () => {
            // Create or select the dialog box
            let dialog = document.getElementById('transaction-dialog');
            if (!dialog) {
                dialog = document.createElement('dialog');
                dialog.id = 'transactionDialog';
                document.body.appendChild(dialog);
            }
            // Fill dialog with details
            dialog.innerHTML = `
                <div style="padding: 24px; min-width: 340px; font-family: Arial, sans-serif;">
                    <h2 style="margin-top:0; color:#1976d2;">Service Request Details</h2>
                    <table style="width:100%; border-collapse:collapse; margin-bottom:16px; font-size:15px;">
                        <tr>
                            <th style="text-align:left; padding:4px 8px; color:#666;">Name</th>
                            <td style="padding:4px 8px;">${item.name || ""}</td>
                        </tr>
                        <tr>
                            <th style="text-align:left; padding:4px 8px; color:#666;">Email</th>
                            <td style="padding:4px 8px;">${item.email || ""}</td>
                        </tr>
                        <tr>
                            <th style="text-align:left; padding:4px 8px; color:#666;">Phone</th>
                            <td style="padding:4px 8px;">${item.phone || ""}</td>
                        </tr>
                        <tr>
                            <th style="text-align:left; padding:4px 8px; color:#666;">Interest</th>
                            <td style="padding:4px 8px;">${item.interest || ""}</td>
                        </tr>
                        <tr>
                            <th style="text-align:left; padding:4px 8px; color:#666;">Preferred Contact</th>
                            <td style="padding:4px 8px;">${item.preferredContact || ""}</td>
                        </tr>
                        <tr>
                            <th style="text-align:left; padding:4px 8px; color:#666;">Contact Timestamp</th>
                            <td style="padding:4px 8px;">
                                ${item.contactTimestamp && typeof item.contactTimestamp.toDate === "function"
                    ? item.contactTimestamp.toDate().toLocaleString()
                    : ""
                }
                            </td>
                        </tr>
                        <tr>
                            <th style="text-align:left; padding:4px 8px; color:#666;">Created At</th>
                            <td style="padding:4px 8px;">
                                ${item.createdAt && typeof item.createdAt.toDate === "function"
                    ? item.createdAt.toDate().toLocaleString()
                    : ""
                }
                            </td>
                        </tr>
                    </table>
                    <button id="closeDialogBtn" style="padding:8px 20px; background:#1976d2; color:#fff; border:none; border-radius:4px; cursor:pointer;">Close</button>
                    <button id="completeTicketBtn" style="padding:8px 20px; background:#43a047; color:#fff; border:none; border-radius:4px; cursor:pointer; margin-left:10px;">Mark as Completed</button>
                </div>
            `;

            // Complete Ticket button logic
            dialog.querySelector('#completeTicketBtn').onclick = async () => {
                const ticketId = item.id;
                if (!ticketId) return;
                try {
                    const ticketRef = doc(db, "concern", ticketId);
                    await updateDoc(ticketRef, {
                        status: "Completed",
                        updatedAt: new Date()
                    });
                    alert("Ticket marked as completed.");
                    dialog.close();
                    // Optionally, refresh the table
                    location.reload();
                } catch (err) {
                    alert("Failed to update ticket: " + err.message);
                }
            };
            dialog.showModal();
            dialog.querySelector('#closeDialogBtn').onclick = () => dialog.close();
        });
        tbody.appendChild(row);
    });
}
renderTransactions();
document.getElementById("view_details").addEventListener("click", () => {
    const dialog = document.getElementById('transactionDialog');
    if (dialog) {
        dialog.close();
    }
    const transactionBody = document.getElementById("transactionBody");
    transactionBody.innerHTML = ""; // Clear previous rows  
});

