async function submitForm() {
  const message = $('#form-message').val();
  const author = $('#form-author').val();
  const sessionId = localStorage.getItem('sessionId');

  $('#form-message, #form-author').val('');

  let messages = await fetch('/messages/new', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, author, sessionId })
  });

  messages = await messages.json();
  displayMessages(messages);
}

function displayMessages(messages) {
  const $messages = $('#messages');

  if (messages.length === 0) {
    $messages.html('<ul class="list-group"><li class="list-group-item">There are no messages</li></ul>');
    return;
  }

  $messages.empty();

  for (const message of messages) {
    const $messageGroup = $('<ul class="list-group mb-4"></li>');

    const $author = $('<li class="list-group-item list-group-item-secondary author"></li>');
    $author.text(`At ${new Date(message.date).toLocaleString()}, ${message.author} (${message.email}) wrote:`);
    $messageGroup.append($author);

    const $messageText = $('<li class="list-group-item"></li>');
    $messageText.text(message.message);
    $messageGroup.append($messageText);

    $messages.prepend($messageGroup);
  }
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

  const email = $('#login-email').val();
  const password = $('#login-password').val();

  $('.login-alert').addClass('d-none');
  $('#logging-in-alert').removeClass('d-none');

  let result = await fetch('/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  result = await result.json();
  $('.login-alert').addClass('d-none');

  if (result.success) {
    localStorage.setItem('sessionId', result.sessionId);
    $('#login-modal').modal('hide');
    $('#login-email, #login-password').val('');
    handleLogin();

  } else if (result.err === -1) {
    $('#invalid-email-warning').removeClass('d-none');
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

  const email = $('#sign-up-email').val();
  const password = $('#sign-up-password').val();

  $('.login-alert').addClass('d-none');
  $('#signing-up-alert').removeClass('d-none');

  let result = await fetch('/users/signUp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  result = await result.json();
  $('.login-alert').addClass('d-none');

  if (result.success) {
    localStorage.setItem('sessionId', result.sessionId);
    $('#sign-up-modal').modal('hide');
    $('#sign-up-email, #sign-up-password').val('');
    handleLogin();

  } else if (result.err === -5) {
    $('#existing-email-warning').removeClass('d-none');
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
  $('body').removeClass('logged-in');
  $('#user-status').text('Not logged in');
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
    $('#user-status').text(loginStatus.email);
    $('body').addClass('logged-in');
  } else {
    logout();
    localStorage.removeItem('sessionId');
  }
}

async function main() {
  $('#main-form').submit(() => {
    submitForm();
    return false;
  });

  $('#login-form-submit').click(() => {
    login();
  });
  $('#login-modal').keypress((e) => {
    if (e.which === 13) login();
  });

  $('#sign-up-form-submit').click(() => {
    signUp();
  });
  $('#sign-up-modal').keypress((e) => {
    if (e.which === 13) signUp();
  });

  $('#login-modal').on('shown.bs.modal', () => $('#login-email').focus());
  $('#sign-up-modal').on('shown.bs.modal', () => $('#sign-up-email').focus());
  $('#logout-button').click(logout);

  loadAndDisplayMessages();
  window.setInterval(loadAndDisplayMessages, 5000);

  handleLogin();
}
