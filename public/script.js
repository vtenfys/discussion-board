async function submitForm() {
  const message = $('#form-message').val();
  const sessionId = localStorage.getItem('sessionId');

  $('#form-message').val('');

  let messages = await fetch('/messages/new', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId })
  });

  messages = await messages.json();
  displayMessages(messages);
}

async function deleteMessage(id) {
  await fetch('/messages/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, sessionId: localStorage.getItem('sessionId') })
  });

  loadAndDisplayMessages();
}

async function editMessage(id, messageText) {
  const $editForm = $('#edit-message-form');
  if ($editForm[0].checkValidity() === false) {
    $editForm.addClass('was-validated');
    return;
  }
  $editForm.removeClass('was-validated');

  $('.login-alert').addClass('d-none');
  $('#updating-message-alert').removeClass('d-none');

  let result = await fetch('/messages/edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, messageText, sessionId: localStorage.getItem('sessionId') })
  });

  result = await result.json();
  $('.login-alert').addClass('d-none');

  if (result.success) {
    $('#edit-message-modal').modal('hide');
    $('#update-message').val('');
    loadAndDisplayMessages();

  } else if (result.err === -6) {
    $('#not-authenticated-warning').removeClass('d-none');
  } else {
    $('#edit-message-unknown-error').removeClass('d-none');
  }
}

function showEditModal(id, messageText) {
  $('#edit-message-modal').modal('show');
  $('#updated-message').val(messageText);
  $('#edit-message-form-submit').off('click').click(() => editMessage(id));

  $('#edit-message-modal').off('keypress').keypress((e) => {
    if (e.which === 13) editMessage(id, $('#updated-message').val());
  });
}

function updateMessageButtons() {
  for (const message of $('.message')) {
    if ($(message).attr('data-username') === localStorage.getItem('username')) {
      $(message).addClass('mine');
    } else {
      $(message).removeClass('mine');
    }
  }
}

function displayMessages(messages) {
  const $messages = $('#messages');

  if (messages.length === 0) {
    $messages.html('<ul class="list-group"><li class="list-group-item">There are no messages</li></ul>');
    return;
  }

  $messages.empty();

  for (const message of messages) {
    const $messageGroup = $('<ul class="list-group mb-4 message"></li>');
    $messageGroup.attr('data-username', message.username);

    const $author = $('<li class="list-group-item list-group-item-secondary author"></li>');
    $author.text(`At ${new Date(message.date).toLocaleString()}, ${message.username} wrote:`);

    $author.append(`<div class="btn-group message-buttons">
                      <button class="btn btn-primary btn-sm edit-button"><i class="fas fa-edit"></i></button>
                      <button class="btn btn-danger btn-sm delete-button"><i class="fas fa-trash"></i></button>
                    </div>`);
    $author.find('.delete-button').click(() => deleteMessage(message._id));
    $author.find('.edit-button').click(() => showEditModal(message._id, message.message));
    $messageGroup.append($author);

    const $messageText = $('<li class="list-group-item"></li>');
    $messageText.text(message.message);
    $messageGroup.append($messageText);

    $messages.prepend($messageGroup);
  }

  updateMessageButtons();
}

async function loadAndDisplayMessages() {
  const messages = await fetch('/messages/get');
  displayMessages(await messages.json());
}

async function login() {
  const $loginForm = $('#login-form');
  if ($loginForm[0].checkValidity() === false) {
    $loginForm.addClass('was-validated');
    return;
  }
  $loginForm.removeClass('was-validated');

  const username = $('#login-username').val();
  const password = $('#login-password').val();

  $('.login-alert').addClass('d-none');
  $('#logging-in-alert').removeClass('d-none');

  let result = await fetch('/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  result = await result.json();
  $('.login-alert').addClass('d-none');

  if (result.success) {
    localStorage.setItem('sessionId', result.sessionId);
    $('#login-modal').modal('hide');
    $('#login-username, #login-password').val('');
    handleLogin();

  } else if (result.err === -1) {
    $('#invalid-username-warning').removeClass('d-none');
  } else if (result.err === -2) {
    $('#incorrect-password-warning').removeClass('d-none');
  } else {
    $('#login-unknown-error').removeClass('d-none');
  }
}

async function signUp() {
  const $signUpForm = $('#sign-up-form');
  if ($signUpForm[0].checkValidity() === false) {
    $signUpForm.addClass('was-validated');
    return;
  }
  $signUpForm.removeClass('was-validated');

  const username = $('#sign-up-username').val();
  const password = $('#sign-up-password').val();

  $('.login-alert').addClass('d-none');
  $('#signing-up-alert').removeClass('d-none');

  let result = await fetch('/users/signUp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  result = await result.json();
  $('.login-alert').addClass('d-none');

  if (result.success) {
    localStorage.setItem('sessionId', result.sessionId);
    $('#sign-up-modal').modal('hide');
    $('#sign-up-username, #sign-up-password').val('');
    handleLogin();

  } else if (result.err === -5) {
    $('#existing-username-warning').removeClass('d-none');
  } else {
    $('#sign-up-unknown-error').removeClass('d-none');
  }
}

async function logout() {
  await fetch('/users/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: localStorage.getItem('sessionId') })
  });

  localStorage.removeItem('sessionId');
  localStorage.removeItem('username');

  $('body').removeClass('logged-in');
  $('#user-status').text('Not logged in');
  updateMessageButtons();
}

async function handleLogin() {
  const sessionId = localStorage.getItem('sessionId');
  if (!sessionId) return;

  let loginStatus = await fetch('/users/getStatus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId })
  });

  loginStatus = await loginStatus.json();

  if (loginStatus.success === true) {
    $('#user-status').text(`Logged in as: ${loginStatus.username}`);
    localStorage.setItem('username', loginStatus.username);

    $('body').addClass('logged-in');
    updateMessageButtons();
  } else {
    logout();
  }
}

async function main() {
  $('#main-form').submit(() => {
    submitForm();
    return false;
  });

  $('#edit-message-form').submit(() => false);

  $('#login-form-submit').click(() => login());
  $('#login-modal').keypress((e) => {
    if (e.which === 13) login();
  });

  $('#sign-up-form-submit').click(() => signUp());
  $('#sign-up-modal').keypress((e) => {
    if (e.which === 13) signUp();
  });

  $('#login-modal').on('shown.bs.modal', () => $('#login-username').focus());
  $('#sign-up-modal').on('shown.bs.modal', () => $('#sign-up-username').focus());
  $('#edit-message-modal').on('shown.bs.modal', () => $('#updated-message').focus().select());

  $('#logout-button').click(logout);

  loadAndDisplayMessages();
  window.setInterval(loadAndDisplayMessages, 5000);

  handleLogin();
}

main();
