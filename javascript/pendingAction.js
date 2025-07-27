import { auth, onAuthStateChanged, query, where, serverTimestamp, updateDoc, reff, onValue, dbd, doc, getDoc, db, collection, getDocs, signOut } from "./config.js";

let currentTransactionData = null;

var uid = null;
onAuthStateChanged(auth, async (user) => {
  if (user) {

    uid = user.uid;

    const docRef = collection(db, "Transactions");
    const q = query(
      docRef,
      where("status", "==", "paid"),
      where("type", "==", "akshrcard"),
      where("actions.delivery", "==", null) // Matches null or missing field
    );
    const querySnapshot = await getDocs(q);
    const rows = [];
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data().akshrcardData);
      rows.push({
        transactionId: doc.id,
        name: doc.data().akshrcardData.cardName || "Unknown",
        isPrinted: !!doc.data().actions?.print,
        isPackaged: !!doc.data().actions?.package,
        isShipped: !!doc.data().actions?.ship,
        isDelivered: !!doc.data().actions?.delivery,
        cardBtnText: "View",
        updated: true
      });
    });
    renderTableRows(rows);





    // ...
  } else {
    // User is signed out
    // ...
    window.location.href = "../login.html";
  }
});



const tableBody = document.getElementById("statusTable");


// Function to render table rows with status checkboxes
function renderTableRows(rowData) {
  tableBody.innerHTML = ""; // Clear previous rows

  // Store original state for comparison
  if (!renderTableRows._originalStates) {
    renderTableRows._originalStates = rowData.map(data => ({ ...data }));
  }

  rowData.forEach((data, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.transactionId}</td>
      <td>${data.name}</td>
      <td><input type="checkbox" class="status-checkbox" data-index="${index}" data-field="isPrinted" ${data.isPrinted ? "checked" : ""} /></td>
      <td><input type="checkbox" class="status-checkbox" data-index="${index}" data-field="isPackaged" ${data.isPackaged ? "checked" : ""} /></td>
      <td><input type="checkbox" class="status-checkbox" data-index="${index}" data-field="isShipped" ${data.isShipped ? "checked" : ""} /></td>
      <td><input type="checkbox" class="status-checkbox" data-index="${index}" data-field="isDelivered" ${data.isDelivered ? "checked" : ""} /></td>
      <td><button class="view-btn" data-transaction-id="${data.transactionId}">View</button></td>
      <td>
        <span class="update-state" data-index="${index}">
          ${data.updated ? '<span class="updated">Updated</span>' : '<button class="update-btn">Update</button>'}
        </span>
      </td>
    `;

    // Add dialog open logic for view button
    const viewBtn = row.querySelector(".view-btn");
    viewBtn.addEventListener("click", async function () {
      await showTransactionDialog(this.getAttribute("data-transaction-id"));
    });

    // Add event listener for update button
    const updateState = row.querySelector(".update-state");
    updateState.addEventListener("click", async function (e) {
      if (e.target.classList.contains("update-btn")) {
        const idx = parseInt(this.getAttribute("data-index"));
        await updateTransactionStatus(rowData[idx], idx);
      }
    });

    tableBody.appendChild(row);
  });

  // Add event listeners to checkboxes
  const checkboxes = tableBody.querySelectorAll(".status-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", async function () {
      const idx = parseInt(this.getAttribute("data-index"));
      const field = this.getAttribute("data-field");

      // Special handling for delivery checkbox
      if (field === "isDelivered" && this.checked) {
        const awbNumber = prompt("Please enter the AWB number for this delivery:");
        if (awbNumber === null) {
          // User cancelled, revert the checkbox
          this.checked = false;
          return;
        }
        if (!awbNumber.trim()) {
          alert("AWB number cannot be empty!");
          this.checked = false;
          return;
        }

        // Store AWB number in the data
        rowData[idx].awbNumber = awbNumber.trim();
      }

      rowData[idx][field] = this.checked;


      // Compare with original state
      const orig = renderTableRows._originalStates[idx];
      const isSame =
        rowData[idx].isPrinted === orig.isPrinted &&
        rowData[idx].isPackaged === orig.isPackaged &&
        rowData[idx].isShipped === orig.isShipped &&
        rowData[idx].isDelivered === orig.isDelivered;

      rowData[idx].updated = isSame;
      updateRowState(idx, isSame);
    });
  });
}

// Helper to update the update/updated state for a row
function updateRowState(index, isUpdated) {
  const updateState = tableBody.querySelector(`.update-state[data-index="${index}"]`);
  if (updateState) {
    updateState.innerHTML = isUpdated
      ? '<span class="updated">Updated</span>'
      : '<button class="update-btn">Update</button>';
  }
}

// Show transaction details dialog
async function showTransactionDialog(transactionId) {
  let dialog = document.getElementById("transaction-dialog");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "transaction-dialog";
    document.body.appendChild(dialog);
  }
  dialog.innerHTML = `<p>Loading...</p>`;
  dialog.showModal();

  try {
    const docRef = doc(db, "Transactions", transactionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      currentTransactionData = { id: transactionId, data };
      dialog.innerHTML = `
        <h3>Transaction: ${transactionId}</h3>
        <div>
          <strong>Created At:</strong> ${data.paid_at ? data.paid_at.toDate().toLocaleString() : "N/A"}<br>
          <strong>Status Timestamps:</strong><br>
          ${data.actions?.print ? `Printed: ${data.actions.print.toDate().toLocaleString()}<br>` : ''}
          ${data.actions?.package ? `Packaged: ${data.actions.package.toDate().toLocaleString()}<br>` : ''}
          ${data.actions?.ship ? `Shipped: ${data.actions.ship.toDate().toLocaleString()}<br>` : ''}
          ${data.actions?.delivery ? `Delivered: ${data.actions.delivery.toDate().toLocaleString()}<br>` : ''}
          <strong>Akshr Card ID:</strong> ${data.akshrcardData?.akshrcardId || "N/A"}<br>
          <strong>Designation:</strong> ${data.akshrcardData?.designation || "N/A"}<br>
          <strong>Theme:</strong> ${data.akshrcardData?.theme || "N/A"}<br>
          <strong>Card Name:</strong> ${data.akshrcardData?.cardName || "N/A"}<br>
          <strong>Tagline:</strong> ${data.akshrcardData?.tagline || "N/A"}<br>
          <strong>Address:</strong> ${data.addressData ? `
            ${data.addressData.addressLine1 || ""} ${data.addressData.addressLine2 || ""}<br>
            ${data.addressData.city || ""}, ${data.addressData.state || ""} ${data.addressData.zip || ""}<br>
            ${data.addressData.country || ""}
          ` : "N/A"}<br>
        </div>
        <button id="generate-pdf-btn">Generate Thank You Note</button>
        <button id="close-dialog-btn">Close</button>
      `;
    } else {
      dialog.innerHTML = `<p>Transaction not found.</p><button id="close-dialog-btn">Close</button>`;
    }
  } catch (e) {
    console.error("Error loading transaction:", e);
    dialog.innerHTML = `<p>Error loading transaction.</p><button id="close-dialog-btn">Close</button>`;
  }

  dialog.querySelector("#close-dialog-btn").onclick = () => dialog.close();
  const pdfBtn = dialog.querySelector("#generate-pdf-btn");
  if (pdfBtn) {
    pdfBtn.onclick = generateThankYouNote;
  }
}

// Update transaction status in Firebase with timestamps
async function updateTransactionStatus(transactionData, index) {
  try {
    const docRef = doc(db, "Transactions", transactionData.transactionId);
    const now = serverTimestamp(); // Use server timestamp for consistency

    // Prepare updates object
    const updates = {
      isPrinted: transactionData.isPrinted,
      isPackaged: transactionData.isPackaged,
      isShipped: transactionData.isShipped,
      isDelivered: transactionData.isDelivered
    };

    // Update timestamps only when status is changed to true
    if (transactionData.isPrinted && !renderTableRows._originalStates[index].isPrinted) {
      updates["actions.print"] = now;
    } else if (!transactionData.isPrinted && renderTableRows._originalStates[index].isPrinted) {
      updates["actions.print"] = null;
    }

    if (transactionData.isPackaged && !renderTableRows._originalStates[index].isPackaged) {
      updates["actions.package"] = now;
    } else if (!transactionData.isPackaged && renderTableRows._originalStates[index].isPackaged) {
      updates["actions.package"] = null;
    }

    if (transactionData.isShipped && !renderTableRows._originalStates[index].isShipped) {
      updates["actions.ship"] = now;
    } else if (!transactionData.isShipped && renderTableRows._originalStates[index].isShipped) {
      updates["actions.ship"] = null;
    }

    if (transactionData.isDelivered && !renderTableRows._originalStates[index].isDelivered) {
      updates["actions.delivery"] = now;
      if (transactionData.awbNumber) {
        updates["awbNumber"] = transactionData.awbNumber;
      }
    } else if (!transactionData.isDelivered && renderTableRows._originalStates[index].isDelivered) {
      updates["actions.delivery"] = null;
    }

    await updateDoc(docRef, updates);

    // Update original state to match current state
    renderTableRows._originalStates[index] = { ...transactionData };
    updateRowState(index, true);

    // Show success feedback
    showToast("Transaction status updated successfully");


  } catch (error) {
    console.error("Error updating document:", error);
    showToast("Failed to update transaction status", "error");
  }
}

// Helper function to show toast notifications
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

async function generateThankYouNote() {
  if (!currentTransactionData) return;

  try {
    const existingPdfBytes = await fetch('./template.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
    const page = pdfDoc.getPages()[0];

    // Cover template text and add personalized message
    page.drawRectangle({
      x: 90,
      y: 90,
      width: 140,
      height: 30,
      color: PDFLib.rgb(1, 1, 1),
    });

    const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
    const text = `Thank you, ${currentTransactionData.data.akshrcardData?.cardName || ''}!`;
    page.drawText(text, {
      x: 100,
      y: 100,
      size: 24,
      font,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'thank_you_note.pdf';
    link.click();
  } catch (e) {
    console.error('Error generating pdf', e);
    showToast('Failed to generate PDF', 'error');
  }
}

