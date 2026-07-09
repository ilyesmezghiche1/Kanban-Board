// STATE — loaded from localStorage, or empty if none saved yet
let columns = JSON.parse(localStorage.getItem("columns")) || [];
let cards = JSON.parse(localStorage.getItem("cards")) || [];

// SAVE
function saveColumns() {
  localStorage.setItem("columns", JSON.stringify(columns));
}
function saveCards() {
  localStorage.setItem("cards", JSON.stringify(cards));
}

// MUTATE — add functions (mutate → save → render)
function addColumn(name, color) {
  const column = new Column(name, color);
  columns.push(column);
  saveColumns();
  renderAll();
}

function addCard(title, description, columnId) {
  const card = new Card(title, description, columnId);
  cards.push(card);
  saveCards();
  renderAll();
}

// RENDER — builds all column boxes, then fills each one with its own cards
function renderColumn() {
  let mainContainer = document.querySelector("#main-container");

  mainContainer.innerHTML = columns.map((column) => `
     <section class="md:snap-start shrink-0 w-full md:w-80 border border-mainborder rounded-2xl p-3">
        <div id="columnheader" class="flex justify-between px-1 pb-3">
            <div class="flex items-center gap-3">
                <h2 class="font-heading text-base font-bold" style="color: ${column.color}">${column.name}</h2>
                <span class="w-6 h-6 flex justify-center items-center font-bold text-xs rounded-2xl" style="color: ${column.color}; background-color: ${column.color}1a;">
                  ${cards.filter(c => c.columnId === column.id).length}
                </span>
            </div>
            <div>
                <span class="relative shrink-0 cursor-pointer"><i class="fa-solid fa-ellipsis"></i></span>
            </div>
        </div>
        <div id="card-container-${column.id}" class="flex flex-col gap-3"></div>
        <div id="columnfooter" class="flex justify-center items-center">
            <input type="button"
              class="column-footer-btn text-ink text-sm font-body py-3 border border-mainborder border-dashed rounded-2xl cursor-pointer w-full mt-3"
              style="--hover-bg: ${column.color}33;"
              value="+ Add Card">
        </div>
     </section>
  `).join("");

  columns.forEach(column => renderCard(column.id));
}
function renderCard(columnId) {
  const column = columns.find((col) => col.id === columnId);
  const columnCards = cards.filter((card) => card.columnId === columnId);
  const cardContainer = document.querySelector(`#card-container-${columnId}`);

  cardContainer.innerHTML = columnCards
    .map(
      (card) => `
    <article class="bg-white border border-mainborder p-4 rounded-2xl overflow-hidden relative">
        <div class="fold absolute top-0 right-0" style="border-width: 0 28px 28px 0; border-color: transparent ${column.color} transparent transparent;"></div>
        <div class="flex justify-between items-start gap-2">
            <h3 class="font-heading font-semibold text-base leading-snug">${card.title}</h3>
            <span class="relative shrink-0 cursor-pointer"><i class="fa-solid fa-ellipsis"></i></span>
        </div>
        <p class="text-ink leading-relaxed text-sm mt-1.5">${card.description}</p>
        <hr class="border border-mainborder my-3">
        <span class="text-ink/60 tracking-wide uppercase text-[11px] font-mono py-1 px-2 bg-nBack rounded-sm font-semibold">created ${card.getAgeInDays()} days ago</span>
    </article>
  `,
    )
    .join("");
}

function renderAll() {
  renderColumn();
}
// initial render on page load
renderAll();
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
    customClass: {
      popup: "swal-popup",
      title: "swal-title",
      confirmButton: "swal-confirm",
      cancelButton: "swal-cancel",
    },
    buttonsStyling: false,
    didOpen: () => {
      const nameInput = document.querySelector("#swal-name");
      nameInput.addEventListener("input", () => {
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
