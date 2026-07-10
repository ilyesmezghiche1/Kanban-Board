// we use .map()and object.assign here because we need to use the methode inside the object not just the data
let columns = (JSON.parse(localStorage.getItem('columns')) || []).map(
  col => Object.assign(new Column(col.name, col.color), col)
);

let cards = (JSON.parse(localStorage.getItem('cards')) || []).map(
  card => Object.assign(new Card(card.title, card.description, card.columnId), card)
);

let draggedCardId = null;


function saveColumns() {
  localStorage.setItem('columns', JSON.stringify(columns));
}
function saveCards() {
  localStorage.setItem('cards', JSON.stringify(cards));
}


function addColumn(name, color) {
  const column = new Column(name, color);
  columns.push(column);
  saveColumns();
  renderAll();
}

function removeColumn(columnId) {
  columns = columns.filter(column => column.id !== columnId);
  cards = cards.filter(card => card.columnId !== columnId);
  saveColumns();
  saveCards();
  renderAll();
}

function addCard(title, description, columnId) {
  const card = new Card(title, description, columnId);
  cards.push(card);
  saveCards();
  renderAll();
}

function removeCard(cardId) {
  cards = cards.filter(card => card.id !== cardId);
  saveCards();
  renderAll();
}

// here we put swalstyle for every swall we use it's better then repeat it every time
const swalStyle = {
  customClass: {
    popup: "swal-popup",
    title: "swal-title",
    confirmButton: "swal-confirm",
    cancelButton: "swal-cancel",
  },
  buttonsStyling: false,
};


function renderColumn() {
  let mainContainer = document.querySelector("#main-container");

  if (columns.length === 0) {
    mainContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center w-full py-16 text-center">
        <i class="fa-solid fa-table-columns text-4xl text-mainborder mb-3"></i>
        <h3 class="font-heading font-semibold text-base text-ink">No columns yet</h3>
        <p class="text-ink/60 text-sm mt-1">Click "+ Add Column" above to get started.</p>
      </div>
    `;
    return;
  }

  mainContainer.innerHTML = columns.map((column) => `
     <section class="md:snap-start shrink-0 w-full md:w-80 border border-mainborder rounded-2xl p-3">
        <div id="columnheader" class="flex justify-between px-1 pb-3">
            <div class="flex items-center gap-3">
                <h2 class="font-heading text-base font-bold" style="color: ${column.color}">${column.name}</h2>
                <span class="w-6 h-6 flex justify-center items-center font-bold text-xs rounded-2xl" style="color: ${column.color}; background-color: ${column.color}1a;">
                  ${cards.filter(c => c.columnId === column.id).length}
                </span>
            </div>
            <div class="relative">
                <span class="relative shrink-0 cursor-pointer column-menu-toggle" data-column-id="${column.id}">
                    <i class="fa-solid fa-ellipsis"></i>
                </span>
                <div class="column-menu hidden absolute right-0 top-6 bg-white border border-mainborder rounded-xl shadow-lg py-1 w-32 z-10" data-column-id="${column.id}">
                    <button class="column-edit-btn w-full text-left px-3 py-2 text-sm hover:bg-blue-50" data-column-id="${column.id}">
                        <i class="fa-solid fa-pen mr-2"></i>Edit
                    </button>
                    <button class="column-delete-btn w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50" data-column-id="${column.id}">
                        <i class="fa-solid fa-trash mr-2"></i>Delete
                    </button>
                </div>
            </div>
        </div>
        <div id="card-container-${column.id}" class="flex flex-col gap-3" data-column-id="${column.id}"></div>
        <div id="columnfooter" class="flex justify-center items-center">
            <input type="button"
              class="column-footer-btn add-card-btn text-ink text-sm font-body py-3 border border-mainborder border-dashed rounded-2xl cursor-pointer w-full mt-3"
              style="--hover-bg: ${column.color}33;"
              data-column-id="${column.id}"
              value="+ Add Card">
        </div>
     </section>
  `).join("");

  columns.forEach(column => renderCard(column.id));
}

function renderCard(columnId) {
  const column = columns.find(col => col.id === columnId);
  const columnCards = cards.filter(card => card.columnId === columnId);
  const cardContainer = document.querySelector(`#card-container-${columnId}`);

  if (columnCards.length === 0) {
    cardContainer.innerHTML = `
      <p class="text-ink/40 text-xs text-center py-6">No cards yet</p>
    `;
    return;
  }

  cardContainer.innerHTML = columnCards.map((card) => `
    <div class="relative" draggable="true" data-card-id="${card.id}">
        <article class="bg-white border border-mainborder p-4 rounded-2xl overflow-hidden relative">
            <div class="fold absolute top-0 right-0" style="border-width: 0 28px 28px 0; border-color: transparent ${column.color} transparent transparent;"></div>
            <div class="flex justify-between items-start gap-2">
                <h3 class="font-heading font-semibold text-base leading-snug">${card.title}</h3>
                <span class="relative shrink-0 cursor-pointer card-menu-toggle" data-card-id="${card.id}">
                    <i class="fa-solid fa-ellipsis"></i>
                </span>
            </div>
            <p class="text-ink leading-relaxed text-sm mt-1.5">${card.description}</p>
            <hr class="border border-mainborder my-3">
            <span class="text-ink/60 tracking-wide uppercase text-[11px] font-mono py-1 px-2 bg-nBack rounded-sm font-semibold">created ${card.getAgeInDays()} days ago</span>
        </article>

        <div class="card-menu hidden absolute right-2 top-12 bg-white border border-mainborder rounded-xl shadow-lg py-1 w-36 z-50" data-card-id="${card.id}">
            <button class="card-edit-btn w-full text-left px-3 py-2 text-sm hover:bg-blue-50" data-card-id="${card.id}">
                <i class="fa-solid fa-pen mr-2"></i>Edit
            </button>
            <div class="card-moveto-wrapper relative" data-card-id="${card.id}">
                <button class="card-moveto-btn w-full text-left px-3 py-2 text-sm hover:bg-blue-50" data-card-id="${card.id}">
                    <i class="fa-solid fa-arrow-right mr-2"></i>Move to
                </button>
                <div class="card-moveto-menu hidden absolute left-full top-0 bg-white border border-mainborder rounded-xl shadow-lg py-1 w-36 z-50" data-card-id="${card.id}">
                    ${columns.filter(col => col.id !== columnId).map(col => `
                        <button class="card-moveto-target w-full text-left px-3 py-2 text-sm hover:bg-blue-50" data-card-id="${card.id}" data-target-column="${col.id}">
                            ${col.name}
                        </button>
                    `).join("")}
                </div>
            </div>
            <button class="card-delete-btn w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50" data-card-id="${card.id}">
                <i class="fa-solid fa-trash mr-2"></i>Delete
            </button>
        </div>
    </div>
  `).join("");
}

function renderAll() {
  renderColumn();
}


let addColumnBtn = document.querySelector("#addColumn");

addColumnBtn.addEventListener("click", () => {
  Swal.fire({
    title: "New column",
    html: `
      <input id="swal-name" class="swal-input" placeholder="Column name">
      <input id="swal-color" type="color" class="swal-color-input" value="#2563eb">
    `,
    confirmButtonText: "Add",
    showCancelButton: true,
    ...swalStyle,
    didOpen: () => {
      document.querySelector("#swal-name").addEventListener("input", () => {
        Swal.resetValidationMessage();
      });
    },
    preConfirm: () => {
      const name = document.querySelector("#swal-name").value.trim();
      const color = document.querySelector("#swal-color").value;

      if (!name) {
        Swal.showValidationMessage("Please enter a column name");
        return false;
      }

      const nameExists = columns.some(
        (column) => column.name.toLowerCase() === name.toLowerCase()
      );

      if (nameExists) {
        Swal.showValidationMessage("A column with this name already exists");
        return false;
      }

      return { name, color };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      addColumn(result.value.name, result.value.color);
    }
  });
});

// ONE DELEGATED LISTENER — handles columns AND cards
document.querySelector("#main-container").addEventListener("click", (e) => {

  // ADD CARD
  const addCardBtn = e.target.closest(".add-card-btn");
  if (addCardBtn) {
    const columnId = addCardBtn.dataset.columnId;

    Swal.fire({
      title: "New card",
      html: `
        <input id="swal-title" class="swal-input" placeholder="Card title">
        <textarea id="swal-desc" class="swal-input" placeholder="Description" rows="3"></textarea>
      `,
      confirmButtonText: "Add",
      showCancelButton: true,
      ...swalStyle,
      didOpen: () => {
        document.querySelector("#swal-title").addEventListener("input", () => {
          Swal.resetValidationMessage();
        });
      },
      preConfirm: () => {
        const title = document.querySelector("#swal-title").value.trim();
        const description = document.querySelector("#swal-desc").value.trim();

        if (!title) {
          Swal.showValidationMessage("Please enter a card title");
          return false;
        }

        return { title, description };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        addCard(result.value.title, result.value.description, columnId);
      }
    });
    return;
  }

  // COLUMN MENU TOGGLE
  const colToggle = e.target.closest(".column-menu-toggle");
  if (colToggle) {
    const columnId = colToggle.dataset.columnId;
    document.querySelector(`.column-menu[data-column-id="${columnId}"]`).classList.toggle("hidden");
    return;
  }

  // COLUMN DELETE
  const colDeleteBtn = e.target.closest(".column-delete-btn");
  if (colDeleteBtn) {
    const columnId = colDeleteBtn.dataset.columnId;
    Swal.fire({
      title: "Delete this column?",
      text: "All cards inside it will be deleted too.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      ...swalStyle,
    }).then((result) => {
      if (result.isConfirmed) {
        removeColumn(columnId);
      }
    });
    return;
  }

  //  COLUMN EDIT
  const colEditBtn = e.target.closest(".column-edit-btn");
  if (colEditBtn) {
    const columnId = colEditBtn.dataset.columnId;
    const column = columns.find(col => col.id === columnId);

    Swal.fire({
      title: "Edit column",
      html: `
        <input id="swal-name" class="swal-input" placeholder="Column name" value="${column.name}">
        <input id="swal-color" type="color" class="swal-color-input" value="${column.color}">
      `,
      confirmButtonText: "Save",
      showCancelButton: true,
      ...swalStyle,
      didOpen: () => {
        document.querySelector("#swal-name").addEventListener("input", () => {
          Swal.resetValidationMessage();
        });
      },
      preConfirm: () => {
        const name = document.querySelector("#swal-name").value.trim();
        const color = document.querySelector("#swal-color").value;

        if (!name) {
          Swal.showValidationMessage("Please enter a column name");
          return false;
        }

        const nameExists = columns.some(
          (col) => col.id !== columnId && col.name.toLowerCase() === name.toLowerCase()
        );

        if (nameExists) {
          Swal.showValidationMessage("A column with this name already exists");
          return false;
        }

        return { name, color };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        column.editColumn(result.value.name, result.value.color);
        saveColumns();
        renderAll();
      }
    });
    return;
  }

  //  CARD MENU TOGGLE
  const cardToggle = e.target.closest(".card-menu-toggle");
  if (cardToggle) {
    const cardId = cardToggle.dataset.cardId;
    document.querySelector(`.card-menu[data-card-id="${cardId}"]`).classList.toggle("hidden");
    return;
  }

  // MOVE TO SUBMENU TOGGLE
  const movetoBtn = e.target.closest(".card-moveto-btn");
  if (movetoBtn) {
    const cardId = movetoBtn.dataset.cardId;
    document.querySelector(`.card-moveto-menu[data-card-id="${cardId}"]`).classList.toggle("hidden");
    return;
  }

  //  MOVE TO TARGET (actually moves the card)
  const moveTarget = e.target.closest(".card-moveto-target");
  if (moveTarget) {
    const cardId = moveTarget.dataset.cardId;
    const targetColumnId = moveTarget.dataset.targetColumn;
    const card = cards.find(c => c.id === cardId);
    card.moveTo(targetColumnId);
    saveCards();
    renderAll();
    return;
  }

  //  CARD DELETE
  const cardDeleteBtn = e.target.closest(".card-delete-btn");
  if (cardDeleteBtn) {
    const cardId = cardDeleteBtn.dataset.cardId;
    Swal.fire({
      title: "Delete this card?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      ...swalStyle,
    }).then((result) => {
      if (result.isConfirmed) {
        removeCard(cardId);
      }
    });
    return;
  }

  // CARD EDIT
  const cardEditBtn = e.target.closest(".card-edit-btn");
  if (cardEditBtn) {
    const cardId = cardEditBtn.dataset.cardId;
    const card = cards.find(c => c.id === cardId);

    Swal.fire({
      title: "Edit card",
      html: `
        <input id="swal-title" class="swal-input" placeholder="Card title" value="${card.title}">
        <textarea id="swal-desc" class="swal-input" placeholder="Description" rows="3">${card.description}</textarea>
      `,
      confirmButtonText: "Save",
      showCancelButton: true,
      ...swalStyle,
      didOpen: () => {
        document.querySelector("#swal-title").addEventListener("input", () => {
          Swal.resetValidationMessage();
        });
      },
      preConfirm: () => {
        const title = document.querySelector("#swal-title").value.trim();
        const description = document.querySelector("#swal-desc").value.trim();

        if (!title) {
          Swal.showValidationMessage("Please enter a card title");
          return false;
        }

        return { title, description };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        card.editCard(result.value.title, result.value.description);
        saveCards();
        renderAll();
      }
    });
    return;
  }

  //  CLICKED OUTSIDE ANY MENU: CLOSE ALL
  document.querySelectorAll(".column-menu, .card-menu, .card-moveto-menu").forEach(menu => menu.classList.add("hidden"));
});

//  DRAG AND DROP
document.querySelector("#main-container").addEventListener("dragstart", (e) => {
  const cardWrapper = e.target.closest("[data-card-id]");
  if (cardWrapper) {
    draggedCardId = cardWrapper.dataset.cardId;
  }
});

document.querySelector("#main-container").addEventListener("dragover", (e) => {
  const container = e.target.closest("[data-column-id]");
  if (container) {
    e.preventDefault();
  }
});

document.querySelector("#main-container").addEventListener("drop", (e) => {
  const container = e.target.closest("[data-column-id]");
  if (container && draggedCardId) {
    const targetColumnId = container.dataset.columnId;
    const card = cards.find(c => c.id === draggedCardId);
    card.moveTo(targetColumnId);
    saveCards();
    renderAll();
    draggedCardId = null;
  }
})

renderAll();
