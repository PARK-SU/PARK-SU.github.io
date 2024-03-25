// Get Recent Chart Title
async function getTitle(url, id) {
  const response = await fetch(
    "https://script.google.com/macros/s/AKfycbwBRXzQ_JRGycDhq2HVoI9_RghUykAZArgDvHJEEW81MqnaOmBsI5LrNIYbe6VsyHw/exec?table=" +
      url
  );
  const data = await response.json();
  data.sort((a, b) => new Date(b.date) - new Date(a.date));
  const loadedTitle = document.getElementById(id);
  loadedTitle.href = data[0].movie_link;
  loadedTitle.textContent = data[0].title;
}

// Get Announcement
async function getAnnouncement(id) {
  const response = await fetch(
    "https://script.google.com/macros/s/AKfycbwBRXzQ_JRGycDhq2HVoI9_RghUykAZArgDvHJEEW81MqnaOmBsI5LrNIYbe6VsyHw/exec?table=announce"
  );
  const data = await response.json();
  // console.log(data);
  if (data.length !== 0) {
    console.log("Announcement exists.");
    const cardFrame = document.createElement("div");
    cardFrame.classList.add("card", "mb-4");

    const cardHeader = document.createElement("div");
    cardHeader.classList.add("card-header");
    cardHeader.innerHTML = `<i class="fa-solid fa-bullhorn me-2"></i>Announcement`;
    cardFrame.appendChild(cardHeader);

    const cardBody = document.createElement("div");
    cardBody.id = "announce";
    cardBody.classList.add("card-body");
    cardFrame.appendChild(cardBody);

    document.getElementById(id).prepend(cardFrame);

    data.sort((a, b) => a.no - b.no);
    const frag = document.createDocumentFragment();
    const announceDIV = document.getElementById("announce");

    announceDIV.innerHTML = "";

    data.forEach((i) => {
      const div = document.createElement("div");
      let str = "";
      if (i.link) {
        str += `<a href="${i.link}">${i.exp}</a>`;
      } else {
        str += i.exp;
      }
      div.innerHTML = str;
      frag.appendChild(div);
    });

    announceDIV.appendChild(frag);
  } else {
    console.log("No Announcement.");
  }
}
