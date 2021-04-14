import "./toggle.scss";

export function generateToggle(id) {
  let label = document.createElement("label");
  label.classList.add("toggle");
  label.id = id;

  let input = document.createElement("input");
  input.type = "checkbox";
  input.classList.add("toggle-input");
  input.checked = true;

  label.appendChild(input);

  let div = document.createElement("div");
  div.classList.add("toggle-fill");

  label.appendChild(div);

  console.log(label);

  return label;
}
