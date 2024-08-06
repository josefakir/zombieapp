const URL_WS = "https://api.soyzombie.com/";

localStorage.setItem("zoom", 1);

const apikey = localStorage.getItem("apikey");
const user_id = localStorage.getItem("user_id");

const formatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

function unformatter(value) {
  value = value.replace("$", "");
  value = value.replace(",", "");
  value = parseFloat(value);
  return value;
}

function traducirTipoGasto(tipogasto) {
  switch (tipogasto) {
    case 1:
      return "GF";
      break;
    case 2:
      return "GV";
      break;
    case 3:
      return "IF";
      break;
    case 4:
      return "IV";
      break;
  }
}
function TipoGasto(tipo) {
  switch (tipo) {
    case "GF":
      return 1;
      break;
    case "GV":
      return 2;
      break;
    case "IF":
      return 3;
      break;
    case "IV":
      return 4;
      break;
  }
}
function percentageToDegrees(percentage) {
  return (percentage / 100) * 360;
}
function refreshSaludFinanciera(user_id, mes, anio) {
  const apikey = localStorage.getItem("apikey");
  $.ajax({
    cache: false,
    url: `${URL_WS}movimientos/${user_id}/${mes}/${anio}`,
    headers: {
      apikey,
    },
    beforeSend: function () {
      $("#loading").show();
    },
    complete: function () {
      $("#loading").hide();
    },
    success: function (data) {
      var output = "";
      var markup = 0;
      $.each(data, function (key, value) {
        output += `<tr class='movimiento_financiero_tabla'>
        <td style="text-transform: capitalize;" class="movimiento_financiero_etiqueta">${
          value.etiqueta
        }</td>
          <td class="movimiento_financiero_tipo">${traducirTipoGasto(
            value.tipo
          )}</td> 
          <td style="display:flex; flex-direction:row; justify-content:space-between; flex-wrap:wrap" class="movimiento_financiero_canitdad">${formatter.format(
            value.cantidad
          )}
          <div>
          <a href="#" class="eliminar_movimiento_financiero" data-id="${
            value.id
          }"><i class="far fa-trash-alt boton_menos " ></i></a>
          <a href="#" class="btn_editar_gasto" data-id_gasto="${
            value.id
          }"><i class="fas fa-pen boton_menos" ></i></a></div>
            
        </td>
        </tr>`;
        if (value.tipo === 1 || value.tipo === 2) {
          markup -= parseFloat(value.cantidad);
        }
        if (value.tipo === 3 || value.tipo === 4) {
          markup += parseFloat(value.cantidad);
        }
      });
      $("#tabla_salud_financieratbody").html(output);
      markup = formatter.format(markup);

      $("#markupQ").html(markup);

      let empty_list = "";
      if ($("#tabla_salud_financieratbody").text() == "") {
        $("#tabla_salud_financiera").hide();
        $("#markup").hide();
        empty_list += `<div class="container" style="text-align: center">
        <h3>Tu lista de depósitos/gastos para este mes está vacía!</h3>
        <p>Agregue sus ingresos y sus gastos para seguirle el rastro a su margen de beneficio.</p>
        <img width="200" height="200" src="img/svg-icons/markup.svg" />
      </div>`;
      } else {
        $("#tabla_salud_financiera").show();
        $("#markup").show();
      }
      $("#empty_list").html(empty_list);
    },
  });
}

function refreshMetas() {
  const apikey = localStorage.getItem("apikey");
  const user_id = localStorage.getItem("user_id");

  let category = $("#input_categoria").val();
  $.ajax({
    cache: false,
    url: `${URL_WS}metas/${category}/${user_id}`,
    headers: {
      apikey,
    },
    beforeSend: function () {
      $("#loading").show();
    },
    complete: function () {
      $("#loading").hide();
    },
    success: function (data) {
      var output = "";
      if (data.length > 0) {
        $(".ver-metas-header").show();

        $.each(data, function (key, value) {
          let percentage_done = parseFloat(value.porcentaje).toFixed(2);
          output += `<div class="meta">
          <div class="clear"></div>
          <div class="c100 p${percentage_done}">
            <span>${percentage_done}%</span>
            <div class="slice">
              <div class="bar"></div>
              <div class="fill"></div>
          
            </div>
          </div>
          <div class="clear"></div><br>
          <div class="titulo_meta">
            <div class="etiqueta_ver_meta">
              ${value.etiqueta}
              <a href="${value.id}" class="btn_completar_meta">
                <i class="fas fa-check"></i>
              </a>
              <a data-id_meta="${value.id}" href="views/ver-metas.html" data-category= "${value.tipo}"class="btn_editar_meta loadview">
                <i class="fas fa-pencil-alt"></i>
              </a>
            </div>
          </div>
          <ul class="lista_ver_metas">`;
          tareas = value.tareas;
          $.each(tareas, function (key, value) {
            output += `<li>${value}</li>`;
          });
          output += `</ul>
          </div>`;
        });
        $("#container_ver_metas").html(output);
      } else {
        $(".ver-metas-header").hide();
        let category = localStorage.getItem("data-category");
        let empty_metas_list = `
          <div style="text-align:center; margin-top:100px">
            <h3>Aún no tienes metas por la categoria ${
              ver_meta_category_data[category - 1].title
            }! </h3>
            <img width="300" height="300" src="${
              ver_meta_category_data[category - 1].image_src
            }"/>
            <a data-category="${category}" href="views/metas.html" class="botonmetas loadview agregar-meta" >
              <i class="fas fa-plus"></i> 
              Agregar Metas
            </a>
          </div> `;
        $("#container_ver_metas").html(empty_metas_list);
      }
    },
  });
}

function orderTodoLists(list) {
  return list.sort((a, b) =>
    a.categoria.toLowerCase() > b.categoria.toLowerCase() ? 1 : -1
  );
}

function createProfileAvatarURL(avatar_value) {
  let random_num = Math.floor(Math.random() * 100);

  if (avatar_value == "null" || avatar_value == null) {
    return `${URL_WS}img/avatar.jpg`;
  } else {
    return `${URL_WS}/${avatar_value}?ts=${random_num}`;
  }
}

function getAllTodoListNames() {
  const apikey = localStorage.getItem("apikey");
  const user_id = localStorage.getItem("user_id");
  $.ajax({
    cache: false,
    url: `${URL_WS}cattodos/${user_id}`,
    headers: {
      apikey,
    },
    beforeSend: function () {
      $("#loading").show();
    },
    complete: function () {
      $("#loading").hide();
    },
    success: function (data) {
      var newArrayDataOfOjbect = Object.values(data);
      data = orderTodoLists(newArrayDataOfOjbect);

      var categoria = $("#select_cattodo").find("option:selected").text();
      var lastCategorySelected = $("#select_cattodo").val();

      if (lastCategorySelected == null) {
        categoria = "Seleccione una";
      }

      var output = `<option value=${lastCategorySelected}>${categoria}</option>`;
      $.each(data, function (key, value) {
        output += `<option value=${value.id}>${value.categoria}</option>`;
      });
      $("#select_cattodo").html(output);
    },
  });
}

function getAllPersonalTodos() {
  const apikey = localStorage.getItem("apikey");
  const user_id = localStorage.getItem("user_id");

  $.ajax({
    cache: false,
    url: `${URL_WS}todos/${user_id}`,
    headers: {
      apikey,
    },
    beforeSend: function () {
      $("#loading").show();
    },
    complete: function () {
      $("#loading").hide();
    },
    success: function (data) {
      data = orderTodoLists(data);
      var output = "";
      $.each(data, function (key, value) {
        let personal_closed_list_arr = localStorage.getItem(
          "personal_closed_lists"
        );
        let visibility_personal_todo;
        let iconType;

        let personal_closed_arr = JSON.parse(personal_closed_list_arr);
        if (
          personal_closed_arr.includes(`personal_todo_list${value.category_id}`)
        ) {
          visibility_personal_todo = "close-todo";
          iconType = "fa-angle-down";
        } else {
          visibility_personal_todo = "open-todo";
          iconType = "fa-angle-up";
        }

        if (value.todos.length > 0) {
          output += `
          <li 
            style='
            display:flex; 
            flex-direction:row; 
            justify-content:space-between; 
            align-items:baseline; 
            padding: 0 2% 0 2%;
            margin-bottom:4px;
            font-size:1.3rem; 
            text-transform:capitalize; 
            background:rgba(193, 143, 207, 0.5)'
            list_id=${value.category_id}
          >
            <strong >
            <a href="#" data-list-id="${value.category_id}" class="btn_open_list"><i style="font-size: 1.5rem; padding:6px"  class="fas ${iconType} "></i></a>
            ${value.categoria}
            </strong>
            <div style="display:flex; flex-direction:row; flex-wrap: nowrap">
              <a 
                href="views/todo.html" 
                style="color:white" 
                class ="share-btn" 
                data-id="${value.category_id}"
              >
                <i class="far fa-share-square"></i>
              </a>
              <a 
                href="#" 
                class ="clear-btn" 
                data-id="${value.category_id}"
              >
                <i class="far fa-trash-alt" style="color:#D3D3D3; margin-left:4px"></i>
              </a>
            </div>
          </li>`;
          output += `<ul style='margin-left:3%;' class="list-unstyled ${visibility_personal_todo}" id="personal_todo_list${value.category_id}">`;

          $.each(value.todos, function (key, todo) {
            if (todo.status == 1) {
              output += `
              <li data_list_id='${value.category_id}'> 
                <a href="#" data-id='${todo.id}' class="eliminar_todo">
                  <i class="fa fa-check-circle"></i>
                  <span style='text-decoration:line-through; color:#D3D3D3'>${todo.texto}</span>
                 </a>
                
              </li>`;
            } else {
              output += `
              <li  data_list_id='${value.category_id}' style='display:flex; flex-direction:row; justify-content:space-between; align-items:baseline'> 
                <div>
                  <a data-id='${todo.id}' class="eliminar_todo">
                    <i class="far fa-circle"></i>
                    <span>${todo.texto}</span>
                  </a>
                </div>
                <a href="#" class="btn_editar_todo" data-id_todo="${todo.id}"><i class="fas fa-pen" ></i>
                </a>
              </li>`;
            }
          });
          output += `</ul>`;
        }
      });

      $("#lista_todos").html(output);
      if ($("#lista_todos").text() == "") {
        $("#empty_todo").show();
      } else {
        $("#empty_todo").hide();
        $("#mensaje_pendientes").html(
          "Para completar el pendiente haga clic en la tarea"
        );
      }
      $("#lista_todos").html(output);
      let current_list = localStorage.getItem("currentlist");
      if (current_list == "personal") {
        $("#lista_todos").show();
        $("#lista_todos_shared").hide();
      } else {
        $("#lista_todos_shared").show();
        $("#lista_todos").hide();
      }
    },
  });
}

function getAllSharedTodos() {
  const apikey = localStorage.getItem("apikey");
  const user_id = localStorage.getItem("user_id");

  $.ajax({
    cache: false,
    url: `${URL_WS}sharedlists/${user_id}`,
    headers: {
      apikey,
    },
    beforeSend: function () {
      $("#loading").show();
    },
    complete: function () {
      $("#loading").hide();
    },
    success: function (data) {
      data = orderTodoLists(data);
      var output = "";
      $.each(data, function (key, value) {
        let last_list_update = new Date(value.categoria_updated);
        let now_before = JSON.parse(localStorage.getItem("now-is"));

        let now_time = new Date(now_before[1]);
        let time_before = new Date(now_before[0]);

        let background_color;
        if (
          +last_list_update.getTime() >= +now_time.getTime() ||
          +last_list_update.getTime() >= +time_before.getTime()
        ) {
          background_color = "rgba(132, 232, 130, 0.5)";
        } else {
          background_color = "rgba(193, 143, 207, 0.5)";
        }

        let shared_closed_list_arr = localStorage.getItem(
          "shared_closed_lists"
        );
        let visibility_shared_todo;
        let iconType;

        let shared_closed_arr = JSON.parse(shared_closed_list_arr);
        if (
          shared_closed_arr.includes(`shared-todo-list${value.category_id}`)
        ) {
          visibility_shared_todo = "close-todo";
          iconType = "fa-angle-down";
        } else {
          visibility_shared_todo = "open-todo";
          iconType = "fa-angle-up";
        }

        if (value.todos.length > 0) {
          output += `
          <li 
            style='
            display:flex; 
            flex-direction:row; 
            justify-content:space-between; 
            align-items:baseline; 
            padding: 0 2% 0 2%;
            margin-bottom:4px;
            font-size:1.3rem; 
            text-transform:capitalize; 
            background:${background_color}'
            list_id=${value.category_id}
            >
              <strong>
              <a href="#" class="btn_open_shared_list" data-list-id="${value.category_id}"><i style="font-size: 1.5rem; padding:6px"   class="fas ${iconType} "   ></i></a>
              ${value.categoria}
              </strong>
              <a href="#" class ="clear-btn" data-id="${value.category_id}">
                <i class="far fa-trash-alt" style="color:#D3D3D3"></i>
              </a>
            </li>`;

          output += `<ul style='margin-left:3%' class="list-unstyled ${visibility_shared_todo}" id="shared-todo-list${value.category_id}">`;
          $.each(value.todos, function (key, todo) {
            let profile_avatar_user = createProfileAvatarURL(todo.avatar);
            let profile_avatar_user_share = createProfileAvatarURL(
              todo.avatar_share
            );

            if (todo.status == 1) {
              output += `
              <li data_list_id='${value.category_id}' >
                <a href="#" data-id='${todo.id}' class="eliminar_todo">
                  <i class="fa fa-check-circle"></i>
                  <span style='text-decoration:line-through; color:#D3D3D3'>${
                    todo.texto
                  }</span>
                </a>
               
                <div style='display:flex; color:#D3D3D3;flex-direction:row; justify-content:space-between; margin-left:3%'>
                  <span>
                    <img style="border-radius:50%; border:2px solid #5fed85" width="25px" height="25px" src='${profile_avatar_user_share}'/>
                    ${todo.completed_by}
                   </span>
                  <span>${todo.updated_at.split(" ")[0]}</span>
                </div> 
              </li>`;
            } else {
              output += `
              <li data_list_id='${value.category_id}'> 
                <div style='display:flex; flex-direction:row; justify-content:space-between; align-items:baseline'>
                  <div>
                    <a data-id='${todo.id}' class="eliminar_todo">
                      <i class="far fa-circle"></i>
                      <span>${todo.texto}</span>
                    </aiv>
                  </div>
                  <a href="#" class="btn_editar_todo" data-id_todo="${todo.id}"><i class="fas fa-pen"></i></a>
                </div>
                <div style='display:flex; color:#D3D3D3; flex-direction:row; justify-content:space-between; margin-left:3%'>
                  <span>
                    <img style="border-radius:50%" width="25px" height="25px" src='${profile_avatar_user}'/>  
                    ${todo.nombre}
                  </span>
                  <span>${todo.created_at.split(" ")[0]}</span>
                </div> 
               </li>`;
            }
          });
          output += `</ul>`;
        }
      });
      $("#lista_todos_shared").html(output);
      let current_list = localStorage.getItem("currentlist");
      if (current_list != "shared") {
        $("#lista_todos_shared").hide();
      } else {
        $("#lista_todos_shared").show();
        $("#lista_todos").hide();
      }

      if (
        $("#lista_todos_shared").text() != "" ||
        $("#lista_todos").text() != ""
      ) {
        $("#empty_todo").hide();
      } else {
        $("#empty_todo").show();
        $("#mensaje_pendientes").html(
          "Para completar el pendiente haga clic en la tarea"
        );
      }
    },
  });
}

function refreshTodos() {
  let now_is_arr;
  now_is_arr = JSON.parse(localStorage.getItem("now-is"));

  if (now_is_arr.length <= 1) {
    now_is_arr.push(new Date());
    localStorage.setItem("now-is", JSON.stringify(now_is_arr));
  } else {
    now_is_arr.shift();
    now_is_arr.push(new Date());
    localStorage.setItem("now-is", JSON.stringify(now_is_arr));
  }

  getAllTodoListNames();
  getAllPersonalTodos();
  getAllSharedTodos();
}

$(document).on("click", "#personal", function (e) {
  e.preventDefault();

  localStorage.setItem("currentlist", "personal");
  $("#lista_todos").show();
  $("#lista_todos_shared").hide();
});

$(document).on("click", "#shared", function (e) {
  e.preventDefault();
  localStorage.setItem("currentlist", "shared");
  $("#lista_todos_shared").show();
  $("#lista_todos").hide();
});

function addPersonalListToShared(data) {
  const apikey = localStorage.getItem("apikey");

  $.ajax({
    cache: false,
    type: "POST",
    data: data,
    url: `${URL_WS}/sharedtodoslist`,
    headers: {
      apikey,
    },
    beforeSend: function () {
      $("#loading").show();
    },
    complete: function () {
      $("#loading").hide();
    },
    error: function (data) {
      console.error(data.statusText);
    },
    success: function (data) {
      console.log(data.status);
    },
  });
}

function invitationToJoinSharedList(data_invite) {
  const apikey = localStorage.getItem("apikey");

  $.ajax({
    url: `${URL_WS}invite`,
    type: "POST",
    data: data_invite,
    cache: false,
    headers: {
      apikey,
    },
    beforeSend: function () {
      $("#loading").show();
    },
    complete: function () {
      $("#loading").hide();
    },
    success: function (data) {
      successAlert(
        "Éxito",
        "La invitación fue enviada por correo electrónico."
      );
    },
    error: function (data) {
      errorAlert("Error", "¡Hubo un error al enviar el correo electrónico!");
    },
  });
}

$(document).on("click", ".share-btn", function (e) {
  e.preventDefault();
  const apikey = localStorage.getItem("apikey");
  const user_id = localStorage.getItem("user_id");
  let category_id = $(this).attr("data-id");

  // 1 .open the pop-up for search
  $.jAlert({
    title: "Buscar usuario por correo electrónico",
    content:
      "<form><label>Ingrese correo electrónico</label><input  id='input_search_user' type='text' class='form-control'></form>",
    closeOnClick: false,
    btns: [
      {
        text: "Buscar",
        theme: "dark_gray",
        closeAlert: true,
        onClick: function (e) {
          e.preventDefault();
          let correo = $("#input_search_user").val();
          // 2. Check if the email exists on the database
          $.ajax({
            cache: false,
            url: `${URL_WS}email/${correo}`,
            headers: {
              apikey,
            },
            beforeSend: function () {
              $("#loading").show();
            },
            complete: function () {
              $("#loading").hide();
            },
            success: function (data) {
              // 3. If email exists Show user name and invite button to send email
              if (data.length > 0) {
                let toShareUserName = data[0].nombre.toUpperCase();
                let toShareId = data[0].id_invited;
                $.jAlert({
                  title: "Éxito",
                  content: `<div><h5 class=' show-text'> El nombre de usuario es: <strong>${toShareUserName}</strong></h5></div>`,
                  btns: [
                    {
                      text: "Invitar",
                      theme: "dark_gray",
                      closeAlert: true,
                      // 5. Create the invitation link and send it to user email
                      onClick: function (e) {
                        e.preventDefault();
                        let data = `id_usuario=${user_id}&id_categoria=${category_id}`;
                        // 6. Add the list id and user_id in the shared lists database table
                        addPersonalListToShared(data);

                        let senderUsername = localStorage.getItem("nombre");
                        let data_invite = `l=${category_id}&u=${correo}&n=${senderUsername}&sid=${user_id}&s=${toShareUserName}&iid=${toShareId}`;
                        //7. Send email to user to join the  todo list
                        invitationToJoinSharedList(data_invite);
                      },
                    },
                  ],
                });
              } else {
                // 4. If email doesn't exist ask user for another email
                errorAlert(
                  "Usuario no encontrado",
                  `<div><h5 class=' show-text'> No hay ningún usuario con correo electrónico <strong>${correo}</strong>. Por favor busque otro correo electrónico</h5></div>`
                );
              }
            },
            error: function (data) {
              errorAlert("Error", "Hubo un error con la solicitud.");
            },
          });
        },
      },
    ],
  });
});

$(document).on("click", ".clear-btn", function (e) {
  e.preventDefault();
  const apikey = localStorage.getItem("apikey");
  let id_categoria = $(this).attr("data-id");
  $.jAlert({
    title: "Eliminar tareas completadas",
    content: "¿Está seguro de que desea borrar todas las tareas completadas?",
    btns: [
      {
        text: "Si",
        theme: "dark_gray",
        onClick: function () {
          $.ajax({
            cache: false,
            url: `${URL_WS}clearcompleted/${id_categoria}`,
            headers: {
              apikey,
            },
            beforeSend: function () {
              $("#loading").show();
            },
            complete: function () {
              $("#loading").hide();
            },
            success: function (data) {
              refreshTodos();
            },
            error: function (data) {
              errorAlert("Error", "¡Hubo un error al eliminar tareas!");
            },
          });
        },
      },
      {
        text: "No",
        theme: "black",
      },
    ],
  });
});

$(document).on("click", ".btn_editar_todo", function (e) {
  e.preventDefault();
  $("#id_todo_editar").val($(this).attr("data-id_todo"));
});

$(document).on("click", ".btn_editar_todo", function (e) {
  e.preventDefault();
  const apikey = localStorage.getItem("apikey");
  let text = $(this).parent().find('.eliminar_todo').text().trim();
  let id_todo = $(this).attr("data-id_todo");
  let id_categoria = $(this).parents("li").attr("data_list_id");

  $.jAlert({
    title: "Editar tarea",
    content: `
    <form>
    <label>Agregar tarea</label>
    <input type="text" value="${text}" id='input_edit_todo_task' class='form-control'/>
    </form>`,
    onOpen: function (alert) {
      alert.find("form").on("submit", function (e) {
        e.preventDefault();
      });
    },
    closeOnClick: true,
    btns: [
      {
        text: "Cancelar",
        theme: "black",
      },
      {
        text: "Guardar",
        theme: "dark_gray",
        closeAlert: false,
        onClick: function (e) {
          e.preventDefault();
          let btn = $(`#${this.id}`),
            alert = btn.parents(".jAlert");

          let edited_todo = $("#input_edit_todo_task").val();

          let data = `edited_todo=${edited_todo}&id_todo=${id_todo}&id_categoria=${id_categoria}`;

          if (edited_todo == null || edited_todo.trim() == "") {
            errorAlert("Error", "¡Por favor ingrese una tarea!");
          } else {
            $.ajax({
              cache: false,
              url: `${URL_WS}edit-todo`,
              type: "POST",
              data: data,
              headers: {
                apikey,
              },
              beforeSend: function () {
                $("#loading").show();
              },
              complete: function () {
                alert.closeAlert();
                $("#loading").hide();
              },
              success: function (data) {
                successAlert("Éxito", "Tu tarea fue guardada correctamente!");
                refreshTodos();
              },
              error: function () {
                errorAlert("Error", "¡Hubo un error al guardar la tarea!");
              },
            });
          }
        },
      },
    ],
  });
});

$(document).on("click", ".btn_open_list", function (e) {
  e.preventDefault();
  if ($(this).find('.fas').hasClass("fa-angle-up")) {
    $(this).find('.fas').removeClass("fa-angle-up");
    $(this).find('.fas').addClass("fa-angle-down");
  } else {
    $(this).find('.fas').removeClass("fa-angle-down");
    $(this).find('.fas').addClass("fa-angle-up");
  }

  let id_list = $(this).attr("data-list-id");
  personal_closed_lists = JSON.parse(
    localStorage.getItem("personal_closed_lists")
  );

  if (personal_closed_lists.includes(`personal_todo_list${id_list}`)) {
    personal_closed_lists = personal_closed_lists.filter(
      (item) => item !== `personal_todo_list${id_list}`
    );
    localStorage.setItem(
      "personal_closed_lists",
      JSON.stringify(personal_closed_lists)
    );
  } else {
    personal_closed_lists.push(`personal_todo_list${id_list}`);
    localStorage.setItem(
      "personal_closed_lists",
      JSON.stringify(personal_closed_lists)
    );
  }
  if ($(`#personal_todo_list${id_list}`).hasClass("close-todo")) {
    $(`#personal_todo_list${id_list}`).removeClass("close-todo");
  } else {
    $(`#personal_todo_list${id_list}`).toggle("slow");
  }
});

$(document).on("click", ".btn_open_shared_list", function (e) {
  e.preventDefault();

  if ($(this).find('.fas').hasClass("fa-angle-up")) {
    $(this).find('.fas').removeClass("fa-angle-up");
    $(this).find('.fas').addClass("fa-angle-down");
  } else {
    $(this).find('.fas').removeClass("fa-angle-down");
    $(this).find('.fas').addClass("fa-angle-up");
  }

  let id_list = $(this).attr("data-list-id");

  shared_closed_lists = JSON.parse(localStorage.getItem("shared_closed_lists"));
  if (shared_closed_lists.includes(`shared-todo-list${id_list}`)) {
    shared_closed_lists = shared_closed_lists.filter(
      (item) => item !== `shared-todo-list${id_list}`
    );
    localStorage.setItem(
      "shared_closed_lists",
      JSON.stringify(shared_closed_lists)
    );
  } else {
    shared_closed_lists.push(`shared-todo-list${id_list}`);
    localStorage.setItem(
      "shared_closed_lists",
      JSON.stringify(shared_closed_lists)
    );
  }
  if ($(`#shared-todo-list${id_list}`).hasClass("close-todo")) {
    $(`#shared-todo-list${id_list}`).removeClass("close-todo");
  } else {
    $(`#shared-todo-list${id_list}`).toggle("slow");
  }
});

function refreshCategorias() {
  const apikey = localStorage.getItem("apikey");
  const user_id = localStorage.getItem("user_id");

  $.ajax({
    cache: false,
    url: `${URL_WS}cattodos-personal/${user_id}`,
    headers: {
      apikey,
    },
    beforeSend: function () {
      $("#loading").show();
    },
    complete: function () {
      $("#loading").hide();
    },
    success: function (data) {
      var output = "";
      $.each(data, function (key, value) {
        output += `
        <tr>
          <td><input class="form-control" type="text" value="${value.categoria}"></td>
          <td>
            <a href="#" class="btn_eliminar_categoria" data-id="${value.id}"><i class="far fa-trash-alt boton_menos" ></i></a>
            <a href="#" class="btn_editar_categoria" data-id="${value.id}"><i class="fas fa-pen boton_menos"></i></a>
          </td>
        </tr>`;
      });
      $("#tabla_categorias_todo").html(output);
    },
  });
}

const zombie_nivel_info = [
  {
    title: "MUERTO VIVIENTE",
    description:
      " Muerto estás, comienza a establecer metas y dar pasos de nuevo hacia la vida.",
    level: 1,
  },
  {
    title: "INFECCIÓN AVANZADA",
    description:
      "El virus aún se encuentra en tu cuerpo, tú puedes deshacerte de él, ¡ánimo!",
    level: 2,
  },

  {
    title: "ESTÁS VIVO",
    description:
      "¡Felicidades! Poco a poco vas cumpliendo con tus metas, establece nuevas y mantente vivo.",
    level: 3,
  },
];

function displayZombieLevel(zombie_nivel, gender) {
  let nivel = zombie_nivel - 1;

  return `<h1 class="tac">${zombie_nivel_info[nivel].title}</h1> 
        <p class="tac">${zombie_nivel_info[nivel].description}</p>
        <img class="zombie" src="img/${gender}/${zombie_nivel}.png" alt="Zombie nivel ${zombie_nivel}">`;
}

$(document).on("click", ".back-category", function (e) {
  var data_category = $(this).attr("data-category");
  localStorage.setItem("data-category", data_category);
});

const ver_meta_category_data = [
  {
    category: 1,
    image_src: "img/svg-icons/mindful.svg",
    title: "ESPIRITUAL",
  },
  {
    category: 2,
    image_src: "img/svg-icons/circulo_cercano.svg",
    title: "CÍRCULO CERCANO",
  },
  { category: 3, image_src: "img/svg-icons/workout.svg", title: "FÍSICO" },
  { category: 4, image_src: "img/svg-icons/work.svg", title: "LABORAL" },
  {
    category: 5,
    image_src: "img/svg-icons/social.svg",
    title: "RESPONSABILIDAD SOCIAL",
  },
  {
    category: 6,
    image_src: "img/svg-icons/education.svg",
    title: "ACADÉMICO",
  },
];

const nameCat_svgImg = {
  circulocercano: {
    img: "img/svg-icons/circulo_cercano.svg",
    name_cat: "Circulo Cercano",
  },
  espiritual: {
    img: "img/svg-icons/mindful.svg",
    name_cat: "Espiritual",
  },
  fisica: {
    img: "img/svg-icons/workout.svg",
    name_cat: "Físico",
  },
  laboral: {
    img: "img/svg-icons/work.svg",
    name_cat: "Laboral",
  },
  responsabilidad: {
    img: "img/svg-icons/social.svg",
    name_cat: "Responsabilidad Social",
  },
  academico: {
    img: "img/svg-icons/education.svg",
    name_cat: "Académico",
  },
};

function displayMetaCategoryHeader(category) {
  let category_index = category - 1;

  $("#icono_ver_metas").attr(
    "src",
    ver_meta_category_data[category_index].image_src
  );
  $("#titulo_ver_metas").html(ver_meta_category_data[category_index].title);
}

var hist = ["home.html"];

function loadView(path, callback) {
  if (hist.length > 2) {
    hist.shift();
  }
  hist.push(path);
  var back = hist[1];

  if (back == path) {
    back = hist[0];
  }

  const apikey = localStorage.getItem("apikey");
  const user_id = localStorage.getItem("user_id");
  let data_category = localStorage.getItem("data-category");

  $("#boton_back").attr({ href: back, "data-category": data_category });
  $("#boton_back").show();

  $.ajax({
    cache: false,
    url: path,
    complete: function () {
      $("#loading").hide();
    },
    success: function (data) {
      $("#appContent").html(data);
      switch (path) {
        case "views/salud-financiera.html":
          // INIT SALUD FINANCIERA
          var today = new Date();
          var anio = today.getFullYear();
          var mes = today.getMonth() + 1;
          $("#input_anio_salud_financiera").val(anio);
          $("#input_mes_salud_financiera").val(mes);
          refreshSaludFinanciera(
            user_id,
            $("#input_mes_salud_financiera").val(),
            $("#input_anio_salud_financiera").val()
          );
          break;
        case "views/home.html":
          $.ajax({
            cache: false,
            url: `${URL_WS}avance_usuario/${user_id}`,
            headers: {
              apikey,
            },
            beforeSend: function () {
              $("#loading").show();
            },
            complete: function () {
              $("#loading").hide();
            },
            success: function (data) {
              var sexo = data.sexo;
              localStorage.setItem("sexo", sexo);
              if (sexo == null) {
                sexo = "h";
              }

              let nivel_zom = data.nivel_zombie;
              if (data.porcentaje_exito_total == 0) {
                nivel_zom = 2;
              }

              let output = displayZombieLevel(nivel_zom, sexo);
              $("#espacio_zombie").html(output);
            },
          });

          break;
        case "views/metas.html":
          let start_position = localStorage.getItem("data-category");
          if (start_position == null) {
            $(".owl-carousel").owlCarousel({
              items: 1,
              startPosition: 0,
              loop: true,
            });
          } else {
            $(".owl-carousel").owlCarousel({
              items: 1,
              startPosition: start_position - 1,
              loop: true,
            });
          }
          break;
        case "views/ver-metas.html":
          displayMetaCategoryHeader($("#input_categoria").val());
          refreshMetas();
          break;
        case "views/recordatorios.html":
          $(".datepicker").datepicker({
            autoclose: true,
            todayHighlight: true,
            startDate: new Date(),
          });
          $(".datepicker").on("focus", function () {
            $(this).trigger("blur");
            $.each($("td.day"), function (i, l) {
              // console.log("Index #" + i + ": " + l);
            });
          });
          break;
        case "views/configuracion.html":
          $(".gender-select").hide();
          $(".email").hide();
          $("#user_name_input").hide();

          var recordatoriomanana = localStorage.getItem("recordatoriomanana");
          var hora_manana = localStorage.getItem("hora_manana");
          var minuto_manana = localStorage.getItem("minuto_manana");
          if (recordatoriomanana === null) {
            $("#hora_recordatorio_manana").hide("fast");
            $("#toggle_manana").prop("checked", false);
          } else {
            $("#hora_recordatorio_manana").show("fast");
            $("#toggle_manana").prop("checked", true);
          }

          if (hora_manana === null) {
            $("#hora_manana").val("");
          } else {
            $("#hora_manana").val(hora_manana);
          }

          if (minuto_manana === null) {
            $("#minuto_manana").val("");
          } else {
            $("#minuto_manana").val(minuto_manana);
          }

          var recordatoriotarde = localStorage.getItem("recordatoriotarde");
          var hora_tarde = localStorage.getItem("hora_tarde");
          var minuto_tarde = localStorage.getItem("minuto_tarde");
          if (recordatoriotarde === null) {
            $("#hora_recordatorio_tarde").hide("fast");
            $("#toggle_tarde").prop("checked", false);
          } else {
            $("#hora_recordatorio_tarde").show("fast");
            $("#toggle_tarde").prop("checked", true);
          }

          if (hora_tarde === null) {
            $("#hora_tarde").val("");
          } else {
            $("#hora_tarde").val(hora_tarde);
          }

          if (minuto_tarde === null) {
            $("#minuto_tarde").val("");
          } else {
            $("#minuto_tarde").val(minuto_tarde);
          }

          $(".toggle").bootstrapToggle({
            on: "Activado",
            off: "Desactivado",
          });

          let avatar_pic = createProfileAvatarURL(
            localStorage.getItem("avatar_url")
          );
          $("#avatar").attr("src", avatar_pic);

          $("#inp").change(function () {
            $(".crop").show();
            $("#rotatebuttons").css("display", "block");
            if (this.files && this.files[0]) {
              var reader = new FileReader();
              reader.onload = function (e) {
                $("#image").attr("src", e.target.result);
                $("#btn_guardar_avatar").css("display", "block");
                var croppie = $("#image").croppie({
                  enableOrientation: true,
                });
                $(document).on("click", ".rotateleft", function (e) {
                  e.preventDefault();
                  croppie.croppie("rotate", parseInt(90));
                });
                $(document).on("click", ".rotateright", function (e) {
                  e.preventDefault();
                  croppie.croppie("rotate", parseInt(-90));
                });

                $(document).on("click", "#btn_guardar_avatar", function (e) {
                  e.preventDefault();

                  croppie
                    .croppie("result", {
                      type: "base64",
                      size: { width: 300, height: 300 },
                      format: "png",
                    })
                    .then(function (r) {
                      var data = `id_usuario=${user_id}&avatar=${r}`;
                      $.ajax({
                        cache: false,
                        headers: {
                          apikey,
                        },
                        type: "POST",
                        data: data,
                        url: `${URL_WS}cambiaravatar`,
                        beforeSend: function () {
                          $("#loading").show();
                        },
                        complete: function () {
                          $("#loading").hide();
                        },
                        error: function (error) {
                          errorAlert(
                            "Error",
                            "Hubo un error al guardar tu foto."
                          );
                        },
                        success: function (data) {
                          localStorage.setItem("avatar_url", data.avatar);
                          let profile_avatar = createProfileAvatarURL(
                            data.avatar
                          );

                          $("#avatar").attr("src", profile_avatar);
                          croppie.croppie("destroy");
                          $(".crop").hide();
                          $("#btn_guardar_avatar").hide();
                          $("#rotatebuttons").hide();
                          successAlert(
                            "Éxito",
                            "Avatar actualizado correctamente"
                          );
                          //setTimeout(function(){ window.location.reload();}, 3000);
                        },
                      });
                    });
                });
              };
              reader.readAsDataURL(this.files[0]);
            }
          });
          let name = localStorage.getItem("nombre");
          let email = localStorage.getItem("correo");
          let sexo = localStorage.getItem("sexo");

          if (sexo == "o") {
            sexo = "No Binario";
          } else if (sexo == "m") {
            sexo = "Mujer";
          } else {
            sexo = "Hombre";
          }
          let output = `
          <div class="user-info">
            <div style="align-items:baseline"> 
              <h3 id="user_name" style="font-size:25px;">${name} </h3>
              <a href="#" id="edit-user-name"><i style="margin-left:4px" class="fas fa-pen" ></i> </a>
            </div> 
            <div>
              <h6 id="email">${email}</h6>
              <a href="#" id="edit-email"><i class="fas fa-pen" ></i></a>
            </div>
            <div>
              <h6 id="gender">${sexo}</h6>
              <a href="#" id="edit-gender"><i class="fas fa-pen"></i></a>
            </div>
          </div>`;
          $("#personal_info").html(output);

          break;
        case "views/completar-tareas.html":
          $.ajax({
            cache: false,
            url: `${URL_WS}avance_usuario/${user_id}`,
            headers: {
              apikey,
            },
            beforeSend: function () {
              $("#loading").show();
            },
            complete: function () {
              $("#loading").hide();
            },
            success: function (data) {
              var metas = data.array_no_revisadas;
              let slides = metas.length;
              if (metas.length > 0) {
                var output = `<div style="text-align:center"> 
                <h2>¡Buen trabajo, ya revisaste tus metas el dia de hoy!</h2>
                <h6>Revísalos de nuevo mañana para alcanzar tus objetivos y dejar de ser un zombi.</h6>
                <img width="200" height="200" src="img/svg-icons/completed_tasks.svg" />
              </div>`;
                $.each(metas, function (key, value) {
                  output += `
                  <li class="pane1" data-info="${value.tarea}|${user_id}|${value.id_meta}">
                    <div class="img">
                    </div>
                    <div>
                      <span class="nombre_tarea_tinder">${value.tarea}</span> 
                        <br>
                      <span class="nombre_meta_tinder">${value.meta}</span>
                        <br>
                      <span  class="nombre_ambito_tinder">${value.ambito}</span>
                    </div>
                    <div class="like"></div>
                    <div class="dislike"></div>
                  </li>`;
                });
                $("#tinderslide ul").html(output);
                $("#tinderslide").jTinder({
                  onDislike: function (item) {
                    var jsonData = '{"info":"' + item.attr("data-info") + '"}';
                    data = JSON.parse(jsonData);

                    if (slides == 1) {
                      $("#completar-info").hide();
                    }
                    $.ajax({
                      cache: false,
                      url: `${URL_WS}nolograrmeta`,
                      type: "POST",
                      data: data,
                      headers: {
                        apikey,
                      },
                      beforeSend: function () {
                        $("#loading").show();
                      },
                      complete: function () {
                        $("#loading").hide();
                      },
                      success: function (data) {
                        slides -= 1;
                      },
                    });
                  },
                  onLike: function (item) {
                    var jsonData = '{"info":"' + item.attr("data-info") + '"}';
                    data = JSON.parse(jsonData);

                    if (slides == 1) {
                      $("#completar-info").hide();
                    }
                    $.ajax({
                      cache: false,
                      url: `${URL_WS}lograrmeta`,
                      type: "POST",
                      data: data,
                      headers: {
                        apikey,
                      },
                      beforeSend: function () {
                        $("#loading").show();
                      },
                      complete: function () {
                        $("#loading").hide();
                      },
                      success: function (data) {
                        slides -= 1;
                      },
                    });
                  },
                });
              } else {
                $("#completar-info").hide();
                $("#mensaje_completar").html(
                  `<div style="margin-top:30%"> 
                    <h2>¡Buen trabajo, ya revisaste tus metas el dia de hoy!</h2>
                    <h6>Revísalos de nuevo mañana para alcanzar tus objetivos y dejar de ser un zombi.</h6>
                    <img width="200" height="200" src="img/svg-icons/completed_tasks.svg" />
                  </div>
                  `
                );
              }
            },
          });
          break;
        case "views/recordatorio-manana.html":
          $.ajax({
            cache: false,
            url: `${URL_WS}metas/${user_id}`,
            headers: {
              apikey,
            },
            beforeSend: function () {
              $("#loading").show();
            },
            complete: function () {
              $("#loading").hide();
            },
            success: function (data) {
              var output = "";
              $.each(data, function (index, item_value) {
                let cat = Object.keys(item_value)[0];
                if (item_value[cat].length > 0) {
                  output += `<h4 style="text-align: center; background-color: #763289">${nameCat_svgImg[cat].name_cat}</h4>`;
                  $.each(item_value[cat], function (index, value) {
                    output += `
                    <div class="meta-tarea-svg">
                      <div class="meta-tarea">
                        <h5 style="color:#495057"> 
                          <strong >${value.etiqueta}</strong>
                        </h5>`;
                    tareas = value.tareas;
                    $.each(tareas, function (key, value) {
                      output += `<p>${value}</p>`;
                    });
                    output += `
                      </div>
                      <img src="${nameCat_svgImg[cat].img}" width="60" height="50" />
                    </div>
                    <hr style="height:1px; border:none; color:#a5cdd4; background-color:#a5cdd4;text-align:center; margin: 0 auto; width:90%;">`;
                  });
                }
              });
              $("#lista_tareas_diaria").html(output);

              let no_tareas = "";
              if ($("#lista_tareas_diaria").text() == "") {
                no_tareas += `<div class="container" style="text-align: center; margin-top:30%">
                <h3>¡No tienes ninguna tarea que recordar!</h3>
                <p>Agregue nuevas tareas para alcanzar sus objetivos a largo plazo.</p>
                <img width="200" height="200" src="img/svg-icons/no_tareas.svg" />
              </div>`;
              }
              $("#no-tareas").html(no_tareas);
            },
          });
          break;
        case "views/todo.html":
          refreshTodos();
          setTimeout(function(){ $('#personal').trigger('click') },10);
          break;
        case "views/administrar-categorias.html":
          refreshCategorias();
          break;
      }
    },
  });
}

$(document).on("click", ".btn_editar_gasto", function (e) {
  e.preventDefault();
  $("#id_gasto_editar").val($(this).attr("data-id_gasto"));
});

$(document).on("click", ".btn_editar_gasto", function (e) {
  e.preventDefault();

  const apikey = localStorage.getItem("apikey");
  const user_id = localStorage.getItem("user_id");
  let btn = $(this),
    tr = btn.parents(".movimiento_financiero_tabla"),
    concepto = tr.find(".movimiento_financiero_etiqueta").text().trim(),
    tipo = tr.find(".movimiento_financiero_tipo").text().trim(),
    cantidad = tr.find(".movimiento_financiero_canitdad").text().trim();

  let new_quantity = unformatter(cantidad);
  let typeInt = TipoGasto(tipo);
  let value_fijo;
  let value_variable;

  if (typeInt == 1 || typeInt == 2) {
    value_fijo = 1;
    value_variable = 2;
  } else {
    value_fijo = 3;
    value_variable = 4;
  }

  $.jAlert({
    title: "Editar gasto",
    content: `
      <form> 
        <input type="text" class="form-control" id="input_etiqueta_edit" value="${concepto}">
        <br> 
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="tipo_gasto_edit" value="${value_fijo}" id="radio_fijo_edit" checked /> 
          <label class="form-check-label" for="radio_fijo">Fijo</label> 
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="tipo_gasto_edit" value="${value_variable}" id="radio_variable_edit" />
          <label class="form-check-label" for="radio_variable">Variable</label>
        </div>
        <br> 
        <input type="number" class="form-control" id="input_cantidad_edit" value="${new_quantity}"/>
      </form>`,
    onOpen: function (alert) {
      alert.find("form").on("submit", function (e) {
        e.preventDefault();
      });
    },
    closeOnClick: true,
    btns: [
      {
        text: "Cancelar",
        theme: "black",
      },
      {
        text: "Guardar",
        theme: "dark_gray",
        closeAlert: false,
        onClick: function (e) {
          e.preventDefault();
          let alert_pop = $(`#${this.id}`).parents(".jAlert");
          let etiqueta = $("#input_etiqueta_edit").val();
          let cantidad = $("#input_cantidad_edit").val();
          let tipo = $("input[name=tipo_gasto_edit]:checked").val();

          var id_gasto = $("#id_gasto_editar").val();

          if (etiqueta === "" || cantidad === "" || tipo === undefined) {
            return errorAlert(
              "Error",
              "Todos los campos son obligatorios (concepto, tipo y cantidad)"
            );
          }
          let data = `etiqueta=${etiqueta}&cantidad=${cantidad}&tipo=${tipo}&id_gasto=${id_gasto}`;
          $.ajax({
            cache: false,
            type: "POST",
            data: data,
            url: `${URL_WS}movimiento-edit`,
            headers: {
              apikey,
            },
            beforeSend: function () {
              $("#loading").show();
            },
            complete: function () {
              alert_pop.closeAlert();
              $("#loading").hide();
            },
            success: function (data) {
              refreshSaludFinanciera(
                user_id,
                $("#input_mes_salud_financiera").val(),
                $("#input_anio_salud_financiera").val()
              );
            },
            error: function (data) {
              errorAlert("Error", "Hubo un error al guardar!");
            },
          });
          return false;
        },
      },
    ],
  });
});

$(document).on("click", ".eliminar_movimiento_financiero", function (e) {
  e.preventDefault();

  const apikey = localStorage.getItem("apikey");
  const user_id = localStorage.getItem("user_id");
  let id_movimiento = $(this).attr("data-id");

  $.jAlert({
    title: "Eliminar el registro",
    content: "¿Está seguro de que desea eliminar este registro?",
    btns: [
      {
        text: "Si",
        theme: "dark_gray",
        onClick: function () {
          $.ajax({
            cache: false,
            headers: {
              apikey,
            },
            url: `${URL_WS}eliminar-movimiento-financiero/${id_movimiento}`,
            beforeSend: function () {
              $("#loading").show();
            },
            complete: function () {
              $("#loading").hide();
            },
            success: function (data) {
              refreshSaludFinanciera(
                user_id,
                $("#input_mes_salud_financiera").val(),
                $("#input_anio_salud_financiera").val()
              );
              successAlert("Éxito", "El registro fue eliminado correctamente");
            },
          });
        },
      },
      {
        text: "No",
        theme: "black",
      },
    ],
  });
});

$(document).ready(function () {
  var auth = localStorage.getItem("auth");
  if (auth === "true") {
    loadView("views/home.html");
  } else {
    loadView("views/login.html");
    $("header").addClass("invisible");
    $("footer").addClass("invisible");
  }
});

$(document).on("click", "#btn_iniciar_sesion", function (e) {
  e.preventDefault();
  $.ajax({
    cache: false,
    beforeSend: function () {
      $("#loading").show();
    },
    complete: function () {
      $("#loading").hide();
    },
    headers: {
      correo: $("#input_email").val(),
      password: $("#input_pass").val(),
    },
    type: "POST",
    url: `${URL_WS}login`,
    success: function (data) {
      localStorage.setItem("auth", true);
      localStorage.setItem("apikey", data[0].apikey);
      localStorage.setItem("correo", data[0].correo);
      localStorage.setItem("nombre", data[0].nombre);
      localStorage.setItem("avatar_url", data[0].avatar);
      localStorage.setItem("user_id", data[0].user_id);
      localStorage.setItem("personal_closed_lists", "[]");
      localStorage.setItem("shared_closed_lists", "[]");
      localStorage.setItem("now-is", "[]");
      $("header").removeClass("invisible");
      $("footer").removeClass("invisible");
      loadView("views/home.html");
    },
    error: function (data) {
      let error_message = JSON.parse(data.responseText);
      errorAlert("Error", error_message.message);
    },
  });
});

$(document).on("click", "#edit-gender", function (e) {
  e.preventDefault();
  $(".gender-select").toggle();
});

$(document).on("click", "#change-gender", function (e) {
  e.preventDefault();
  const apikey = localStorage.getItem("apikey");
  const user_id = localStorage.getItem("user_id");
  let sexo = $("#input_sexo").val();

  let gender = $("#input_sexo option:selected").text();

  let data = `id_usuario=${user_id}&sexo=${sexo}`;
  $.ajax({
    type: "POST",
    url: `${URL_WS}updategender`,
    data: data,
    cache: false,
    headers: {
      apikey,
    },
    beforeSend: function () {
      $("#loading").show();
    },
    complete: function () {
      $("#loading").hide();
    },
    success: function (data) {
      successAlert("Éxito", "Tu género cambió con éxito!");
      $(".gender-select").hide();
      $("#gender").text(gender);
    },
    error: function (data) {
      errorAlert("Error", "Por favor seleccione un género!");
    },
  });
});

$(document).on("click", "#edit-email", function () {
  $(".email").toggle();
});

$(document).on("click", "#change-email-btn", function (e) {
  e.preventDefault();
  const apikey = localStorage.getItem("apikey");
  const user_id = localStorage.getItem("user_id");
  let email = $("#input_edit_email").val();

  let data = `id_usuario=${user_id}&email=${email}`;
  if (validateEmail(email)) {
    $.ajax({
      type: "POST",
      data: data,
      cache: false,
      headers: {
        apikey,
      },
      url: `${URL_WS}editemail`,
      beforeSend: function () {
        $("#loading").show();
      },
      complete: function () {
        $("#loading").hide();
      },
      success: function (data) {
        successAlert("Éxito", "¡Tu correo electrónico cambió correctamente!");
        $(".email").hide();
        $("#email").text(email);
        localStorage.setItem("correo", email);
      },
      error: function (data) {
        errorAlert("Error", "¡Seleccione un correo electrónico único!");
      },
    });
  } else {
    errorAlert("Error", "¡Agregue un nuevo correo electrónico válido!");
  }
});

$(document).on("click", "#edit-user-name", function () {
  $("#user_name_input").toggle();
});

$(document).on("click", "#save_user_name_btn", function (e) {
  e.preventDefault();
  const apikey = localStorage.getItem("apikey");
  const user_id = localStorage.getItem("user_id");
  let user_name = $("#input_user_name").val();

  if (user_name.trim() == "") {
    errorAlert("Error", "¡Agregue un nombre válido!");
  } else {
    let data = `id_usuario=${user_id}&user_name=${user_name}`;
    $.ajax({
      type: "POST",
      data: data,
      cache: false,
      headers: {
        apikey,
      },
      url: `${URL_WS}username`,
      beforeSend: function () {
        $("#loading").show();
      },
      complete: function () {
        $("#loading").hide();
      },
      success: function (data) {
        $("#user_name_input").hide();
        successAlert("Éxito", "¡Tu nombre se guardó correctamente!");
        $("#user_name").text(user_name);
        localStorage.setItem("nombre", user_name);
      },
      error: function (data) {
        errorAlert("Error", "¡Hubo un error al guardar tu nombre!");
      },
    });
  }
});

$(document).on("click", "#cerrar_menu", function (e) {
  e.preventDefault();
  $("#menu").slideUp("fast");
});

$(document).on("click", "#trigger_menu", function (e) {
  e.preventDefault();
  $("#menu").slideDown("fast");
});

$(document).on("click", "#btn_logout", function (e) {
  e.preventDefault();
  $("#menu").hide();
  localStorage.clear();
  loadView("views/login.html");
  $("header").addClass("invisible");
  $("footer").addClass("invisible");
});

$(document).on("click", ".loadview", function (e) {
  e.preventDefault();
  var path = $(this).attr("href");
  loadView(path, function () {});
  $("#menu").hide();
  $("#input_categoria").val($(this).attr("data-category"));
});

$(document).on("click", "#btn_agregar_ingreso", function (e) {
  e.preventDefault();
  const apikey = localStorage.getItem("apikey");
  const user_id = localStorage.getItem("user_id");

  $.jAlert({
    title: "Agregar ingreso",
    content: `
    <form> 
      <input type="text" class="form-control" id="input_etiqueta" placeholder="Concepto">
      <br> 
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" name="tipo_gasto" value="" id="radio_fijo" /> 
        <label class="form-check-label" for="radio_fijo">Fijo</label> 
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" name="tipo_gasto" value="" id="radio_variable"/>
        <label class="form-check-label" for="radio_variable">Variable</label>
      </div>
      <br> 
      <input type="number" class="form-control" id="input_cantidad" placeholder="Cantidad"/>
    </form>`,
    onOpen: function (alert) {
      alert.find("form").on("submit", function (e) {
        e.preventDefault();
      });
    },
    closeOnClick: true,
    btns: [
      {
        text: "Guardar",
        theme: "dark_gray",
        closeAlert: false,
        onClick: function (e) {
          e.preventDefault();
          let alert_pop = $(`#${this.id}`).parents(".jAlert");
          let mes = $("#input_mes_salud_financiera").val();
          let anio = $("#input_anio_salud_financiera").val();
          let etiqueta = $("#input_etiqueta").val();
          let cantidad = $("#input_cantidad").val();
          let tipo = $("input[name=tipo_gasto]:checked").val();

          if (etiqueta == "" || cantidad == "" || tipo == undefined) {
            return errorAlert(
              "Error",
              "Todos los campos son obligatorios (concepto, tipo y cantidad)"
            );
          }
          let data = `mes=${mes}&anio=${anio}&etiqueta=${etiqueta}&cantidad=${cantidad}&tipo=${tipo}&id_usuario=${user_id}`;
          $.ajax({
            cache: false,
            type: "POST",
            data: data,
            url: `${URL_WS}movimiento`,
            headers: {
              apikey,
            },
            beforeSend: function () {
              $("#loading").show();
            },
            complete: function () {
              alert_pop.closeAlert();
              $("#loading").hide();
            },
            success: function (data) {
              refreshSaludFinanciera(
                user_id,
                $("#input_mes_salud_financiera").val(),
                $("#input_anio_salud_financiera").val()
              );
            },
            error: function (data) {
              errorAlert("Error", "Hubo un error al guardar!");
            },
          });
        },
      },
    ],
  });

  $("#radio_fijo").val(3);
  $("#radio_variable").val(4);
});

$(document).on("click", "#btn_agregar_gasto", function (e) {
  e.preventDefault();
  const apikey = localStorage.getItem("apikey");
  const user_id = localStorage.getItem("user_id");

  $.jAlert({
    title: "Agregar gasto",
    content: `
    <form> 
      <input type="text" class="form-control" id="input_etiqueta" placeholder="Concepto">
      <br> 
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" name="tipo_gasto" value="" id="radio_fijo" /> 
        <label class="form-check-label" for="radio_fijo">Fijo</label> 
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" name="tipo_gasto" value="" id="radio_variable"/>
        <label class="form-check-label" for="radio_variable">Variable</label>
      </div>
      <br> 
      <input type="number" class="form-control" id="input_cantidad" placeholder="Cantidad"/>
    </form>`,
    onOpen: function (alert) {
      alert.find("form").on("submit", function (e) {
        e.preventDefault();
      });
    },
    closeOnClick: true,
    btns: [
      {
        text: "Guardar",
        theme: "dark_gray",
        closeAlert: false,
        onClick: function (e) {
          e.preventDefault();

          let alert_pop = $(`#${this.id}`).parents(".jAlert");
          let mes = $("#input_mes_salud_financiera").val();
          let anio = $("#input_anio_salud_financiera").val();
          let etiqueta = $("#input_etiqueta").val();
          let cantidad = $("#input_cantidad").val();
          let tipo = $("input[name=tipo_gasto]:checked").val();

          if (etiqueta == "" || cantidad == "" || tipo == undefined) {
            return errorAlert(
              "Error",
              "Todos los campos son obligatorios (concepto, tipo y cantidad)"
            );
          }

          let data = `mes=${mes}&anio=${anio}&etiqueta=${etiqueta}&cantidad=${cantidad}&tipo=${tipo}&id_usuario=${user_id}`;
          $.ajax({
            cache: false,
            type: "POST",
            data: data,
            url: `${URL_WS}movimiento`,
            headers: {
              apikey,
            },
            beforeSend: function () {
              $("#loading").show();
            },
            complete: function () {
              alert_pop.closeAlert();
              $("#loading").hide();
            },
            success: function (data) {
              refreshSaludFinanciera(
                user_id,
                $("#input_mes_salud_financiera").val(),
                $("#input_anio_salud_financiera").val()
              );
            },
            error: function (data) {
              errorAlert("Error", "Hubo un error al guardar!");
            },
          });
          return false;
        },
      },
    ],
  });
  $("#radio_fijo").val(1);
  $("#radio_variable").val(2);
});

$(document).on("change", "#input_mes_salud_financiera", function (e) {
  e.preventDefault();
  const user_id = localStorage.getItem("user_id");
  refreshSaludFinanciera(
    user_id,
    $("#input_mes_salud_financiera").val(),
    $("#input_anio_salud_financiera").val()
  );
});

$(document).on("change", "#input_anio_salud_financiera", function (e) {
  e.preventDefault();
  const user_id = localStorage.getItem("user_id");
  refreshSaludFinanciera(
    user_id,
    $("#input_mes_salud_financiera").val(),
    $("#input_anio_salud_financiera").val()
  );
});

$(document).on("click", ".agregar-meta", function (e) {
  e.preventDefault();
  const apikey = localStorage.getItem("apikey");
  const user_id = localStorage.getItem("user_id");
  localStorage.setItem("data-category", $("#input_categoria").val());

  $.jAlert({
    title: "Agregar Metas",
    content: `<form>
        <label>Nombre de meta</label>
          <input type="text" id="input_nombre_meta" class="agregar-meta-input form-control" placeholder="¿Qué quieres lograr?">
        <br>
        <label>Tarea</label>
          <input type="text" id="input_tarea" class="agregar-meta-input form-control" placeholder="¿Que tienes que hacer?">
      </form>`,
    onOpen: function (alert) {
      alert.find("form").on("submit", function (e) {
        e.preventDefault();
      });
    },
    closeOnClick: true,
    btns: [
      {
        text: "Guardar",
        theme: "dark_gray",
        closeAlert: false,
        onClick: function (e) {
          e.preventDefault();
          var btn = $(`#${this.id}`),
            alert = btn.parents(".jAlert"),
            form = alert.find("form"),
            meta = form.find('input[id="input_nombre_meta"]').val(),
            tarea = form.find('input[id="input_tarea"]').val();

          if (typeof meta == "undefined" || meta == "") {
            $.jAlert({
              title: "Error",
              content: "Por favor ingrese una meta!",
            });
            return;
          }
          if (typeof tarea == "undefined" || tarea == "") {
            $.jAlert({
              title: "Error",
              content: "Por favor ingrese una tarea!",
            });
            return;
          }
          let category = $("#input_categoria").val();
          let data = `id_usuario=${user_id}&etiqueta=${meta}&tipo=${category}&tareas=${tarea}`;

          $.ajax({
            cache: false,
            url: `${URL_WS}meta`,
            type: "POST",
            data: data,
            headers: {
              apikey,
            },
            beforeSend: function () {
              $("#loading").show();
            },
            complete: function () {
              alert.closeAlert();
              $("#loading").hide();
            },
            success: function (data) {
              successAlert("Éxito", "Tu meta fue guardada correctamente!");
              refreshMetas();
            },
            error: function (data) {
              errorAlert("Error", "Hubo un error al guardar!");
            },
          });

          return false;
        },
      },
    ],
  });
});

$(document).on("click", ".btn_editar_meta", function (e) {
  localStorage.setItem("data-category", $("#input_categoria").val());

  e.preventDefault();
  const apikey = localStorage.getItem("apikey");
  var btn = $(this),
    tr = btn.parents(".meta"),
    meta = tr.find(".etiqueta_ver_meta").text().trim(),
    tarea = tr.find(".lista_ver_metas li").text().trim();

  $.jAlert({
    title: "Editar Meta",
    content: `<form>
      <label>Nombre de meta</label>
        <input type="text" id="input_nombre_meta" class="agregar-meta-input form-control" value="${meta}">
      <br>
      <label>Agregar tarea</label>
        <input type="text" id="input_tarea" class="agregar-meta-input form-control" value="${tarea}">
    </form>`,
    onOpen: function (alert) {
      alert.find("form").on("submit", function (e) {
        e.preventDefault();
      });
    },
    closeOnClick: true,
    btns: [
      {
        text: "Cancelar",
        theme: "black",
      },
      {
        text: "Guardar",
        theme: "dark_gray",
        closeAlert: false,
        onClick: function (e) {
          e.preventDefault();
          var btn = $(`#${this.id}`),
            alert = btn.parents(".jAlert"),
            form = alert.find("form"),
            meta = form.find('input[id="input_nombre_meta"]').val(),
            tarea = form.find('input[id="input_tarea"]').val();

          if (typeof meta == "undefined" || meta.trim() == "") {
            $.jAlert({
              title: "Error",
              content: "Por favor ingrese una meta!",
            });
            return;
          }
          if (typeof tarea == "undefined" || tarea.trim() == "") {
            $.jAlert({
              title: "Error",
              content: "Por favor ingrese una tarea!",
            });
            return;
          }
          var id_meta = $("#id_meta_editar").val();
          let category = $("#input_categoria").val();
          let data = `id_meta=${id_meta}&etiqueta=${meta}&tipo=${category}&tareas=${tarea}`;

          $.ajax({
            cache: false,
            url: `${URL_WS}update/meta`,
            type: "POST",
            data: data,
            headers: {
              apikey,
            },
            beforeSend: function () {
              $("#loading").show();
            },
            complete: function () {
              alert.closeAlert();
              $("#loading").hide();
            },
            success: function (data) {
              successAlert("Éxito", "Tu meta fue guardada correctamente!");
              refreshMetas();
            },
            error: function (data) {
              errorAlert("Error", "Hubo un error al guardar!");
            },
          });

          return false;
        },
      },
    ],
  });
});

$(document).on("click", ".btn_completar_meta", function (e) {
  e.preventDefault();
  const apikey = localStorage.getItem("apikey");
  var id_meta = $(this).attr("href");

  $.jAlert({
    title: "Meta completada",
    content: "¿Estás seguro de que el objetivo se completó?",
    btns: [
      {
        text: "Si",
        theme: "dark_gray",
        onClick: function () {
          $.ajax({
            cache: false,
            headers: {
              apikey,
            },
            url: `${URL_WS}completar-meta/${id_meta}`,
            beforeSend: function () {
              $("#loading").show();
            },
            complete: function () {
              $("#loading").hide();
            },
            success: function (data) {
              successAlert("Éxito", "¡Tu meta fue completada correctamente!");
              refreshMetas();
            },
          });
        },
      },
      {
        text: "No",
        theme: "black",
      },
    ],
  });
});

$(document).on("click", ".btn_editar_meta", function (e) {
  e.preventDefault();
  $("#id_meta_editar").val($(this).attr("data-id_meta"));
});

$(document).on("change", "#toggle_manana", function (e) {
  if ($(this).prop("checked") == true) {
    //ACTIVAR RECORDATORIO POR LAS MAÑANAS
    $("#hora_recordatorio_manana").show("fast");
    localStorage.setItem("recordatoriomanana", "1");
  } else {
    //DESACTIVAR RECORDATORIO POR LAS MAÑANAS
    $("#hora_recordatorio_manana").hide("fast");
    cordova.plugins.notification.local.cancel(1, function () {
      successAlert("Éxito", "Tu alerta fue desactivada");
    });
    localStorage.removeItem("recordatoriomanana");
    localStorage.removeItem("hora_manana");
    localStorage.removeItem("minuto_manana");
  }
});

$(document).on("change", "#hora_manana", function (e) {
  localStorage.setItem("hora_manana", $(this).val());
  //Ejecutar recordatorio si amgos están seteados
  if (
    localStorage.getItem("hora_manana") != null &&
    localStorage.getItem("minuto_manana") != null
  ) {
    var hora = parseInt($("#hora_manana").val());
    var minuto = parseInt($("#minuto_manana").val());
    cordova.plugins.notification.local.schedule({
      id: 1,
      title: "Recuerde revisar sus tareas diarias",
      text: "Al avanzar diariamente te acercas a tus metas",
      trigger: { every: { hour: hora, minute: minuto } },
      foreground: true,
    });
  }
});

$(document).on("change", "#minuto_manana", function (e) {
  localStorage.setItem("minuto_manana", $(this).val());
  //Ejecutar recordatorio si amgos están seteados
  if (
    localStorage.getItem("hora_manana") != null &&
    localStorage.getItem("minuto_manana") != null
  ) {
    var hora = parseInt($("#hora_manana").val());
    var minuto = parseInt($("#minuto_manana").val());
    cordova.plugins.notification.local.schedule({
      id: 1,
      title: "Recuerde revisar sus tareas diarias",
      text: "Al avanzar diariamente te acercas a tus metas",
      trigger: { every: { hour: hora, minute: minuto } },
      foreground: true,
    });
  }
});

$(document).on("change", "#toggle_tarde", function (e) {
  if ($(this).prop("checked") == true) {
    //ACTIVAR RECORDATORIO POR LAS MAÑANAS
    $("#hora_recordatorio_tarde").show("fast");
    localStorage.setItem("recordatoriotarde", "1");
  } else {
    //DESACTIVAR RECORDATORIO POR LAS MAÑANAS
    cordova.plugins.notification.local.cancel(2, function () {
      successAlert("Éxito", "Tu alerta fue desactivada");
    });
    $("#hora_recordatorio_tarde").hide("fast");
    localStorage.removeItem("recordatoriotarde");
    localStorage.removeItem("hora_tarde");
    localStorage.removeItem("minuto_tarde");
  }
});

$(document).on("change", "#hora_tarde", function (e) {
  localStorage.setItem("hora_tarde", $(this).val());
  //Ejecutar recordatorio si amgos están seteados
  if (
    localStorage.getItem("hora_tarde") != null &&
    localStorage.getItem("minuto_tarde") != null
  ) {
    var hora = parseInt($("#hora_tarde").val());
    var minuto = parseInt($("#minuto_tarde").val());
    cordova.plugins.notification.local.schedule({
      id: 2,
      title: "Recuerde revisar sus tareas diarias",
      text: "Al avanzar diariamente te acercas a tus metas",
      trigger: { every: { hour: hora, minute: minuto } },
      foreground: true,
    });
  }
});

$(document).on("change", "#minuto_tarde", function (e) {
  localStorage.setItem("minuto_tarde", $(this).val());
  //Ejecutar recordatorio si amgos están seteados
  if (
    localStorage.getItem("hora_tarde") != null &&
    localStorage.getItem("minuto_tarde") != null
  ) {
    var hora = parseInt($("#hora_tarde").val());
    var minuto = parseInt($("#minuto_tarde").val());
    cordova.plugins.notification.local.schedule({
      id: 2,
      title: "Recuerde revisar sus tareas diarias",
      text: "Al avanzar diariamente te acercas a tus metas",
      trigger: { every: { hour: hora, minute: minuto } },
      foreground: true,
    });
  }
});

$(document).on("click", "#avatar", function (e) {
  $("#inp").trigger("click");
});

$(document).on("click", "#btn_guardar_recordatorio", function (e) {
  e.preventDefault();
  if (
    $("#input_fecha_recordatorio").val() == "" ||
    $("#input_nombre_recordatorio").val() == "" ||
    $("#input_descripcion_recordatorio").val() == "" ||
    $("#input_hora_recordatorio").val() == "" ||
    $("#input_minuto_recordatorio").val() == ""
  ) {
    errorAlert("Error", "Todos los campos son obligatorios");
  } else {
    var fecha = String($("#input_fecha_recordatorio").val());
    fecha = fecha.split("/");
    var anio = parseInt(fecha[2]);
    var mes = parseInt(fecha[0]) - 1;
    var dia = parseInt(fecha[1]);
    var hora = parseInt($("#input_hora_recordatorio").val());
    var horamasuno = hora + 1;
    var minuto = parseInt($("#input_minuto_recordatorio").val());

    var startDate = new Date(anio, mes, dia, hora, minuto, 0, 0, 0); // beware: month 0 = january, 11 = december
    var endDate = new Date(anio, mes, dia, horamasuno, minuto, 0, 0, 0);
    var title = $("#input_nombre_recordatorio").val();
    var eventLocation = "";
    var notes = $("#input_descripcion_recordatorio").val();
    var success = function (message) {
      // alert("Success: " + JSON.stringify(message));
      successAlert("Éxito", "Tu recordatorio fue guardado");
      $("#input_fecha_recordatorio").val("");
      $("#input_nombre_recordatorio").val("");
      $("#input_descripcion_recordatorio").val("");
      $("#input_hora_recordatorio").val("");
      $("#input_minuto_recordatorio").val("");
      $("#loading").hide();
    };
    var error = function (message) {
      errorAlert("Error", "Hubo un error al guardar tu recordatorio");
      $("#loading").hide();
    };
    window.plugins.calendar.createEventInteractively(
      title,
      eventLocation,
      notes,
      startDate,
      endDate,
      success,
      error
    );
  }
});

$(document).on("click", "#btn_abrir_calendario", function (e) {
  e.preventDefault();
  window.plugins.calendar.openCalendar();
});

function validateEmail(email) {
  let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}

function CheckPasswordValidity(input_password) {
  let decimal =
    /^(?!.* )([A-z0-9!@#$%^&*().,<>{}[\]<>?_=+\-|;:\'\"\/]).{3,25}$/;
  if (input_password.match(decimal)) {
    return true;
  } else {
    return false;
  }
}

function checkNameValidity(user_name) {
  let valid_pattern = /^[a-zA-Z-.'\ ]{2,30}$/;
  if (user_name.match(valid_pattern)) {
    return true;
  } else {
    return false;
  }
}

$(document).on("click", "#btn_registrarme", function (e) {
  e.preventDefault();
  let nombre = $("#input_nombre").val();
  let correo = $("#input_email").val();
  let contrasena = $("#input_pass").val();
  let confirm_contrasena = $("#input_confirm_pass").val();
  let sexo = $("#input_sexo").val();

  if (checkNameValidity(nombre) == false) {
    return errorAlert("Error", "Por favor ingrese un nombre valido");
  }
  if (validateEmail(correo) == false) {
    return errorAlert(
      "Error",
      "Por favor introduzca una dirección de correo electrónico válida!"
    );
  }
  if (nombre == "" || correo == "" || contrasena == "") {
    return errorAlert(
      "Error",
      "Todos los campos son obligatorios (Nombre, correo y contraseña)!"
    );
  }
  if (CheckPasswordValidity(contrasena) == false) {
    return errorAlert(
      "Error",
      "La longitud de la contraseña no debe ser menos de 4 caracteres y no debe contener espacios."
    );
  }
  if (contrasena != confirm_contrasena) {
    return errorAlert("Error", " Las contraseñas no corresponden");
  }

  $.ajax({
    cache: false,
    url: URL_WS + "registrar",
    type: "POST",
    headers: {
      nombre: nombre,
      correo: correo,
      password: contrasena,
      sexo: sexo,
    },
    beforeSend: function () {
      $("#loading").show();
    },
    complete: function () {
      $("#loading").hide();
    },
    success: function (data) {
      if (data.status == "success") {
        $.ajax({
          cache: false,
          headers: {
            correo: $("#input_email").val(),
            password: $("#input_pass").val(),
          },
          type: "POST",
          url: `${URL_WS}login`,
          success: function (data) {
            localStorage.setItem("auth", true);
            localStorage.setItem("apikey", data[0].apikey);
            localStorage.setItem("correo", data[0].correo);
            localStorage.setItem("nombre", data[0].nombre);
            localStorage.setItem("avatar_url", data[0].avatar);
            localStorage.setItem("user_id", data[0].user_id);
            localStorage.setItem("personal_closed_lists", "[]");
            localStorage.setItem("shared_closed_lists", "[]");
            localStorage.setItem("now-is", "[]");
            $("header").removeClass("invisible");
            $("footer").removeClass("invisible");
            loadView("views/home.html");
          },
          error: function (data) {
            let error_message = JSON.parse(data.responseText);
            errorAlert("Error", error_message.message);
          },
        });

        successAlert("Éxito", "Tu registro fué satisfactorio");
      }
    },
    error: function () {
      errorAlert(
        "Error",
        "Hubo un error al registrarte. Este correo electrónico ya se usó"
      );
    },
  });
});

$(document).on("click", ".eliminar_todo", function (e) {
  e.preventDefault();
  const apikey = localStorage.getItem("apikey");
  const user_id = localStorage.getItem("user_id");

  let id_todo = $(this).attr("data-id");
  let nombre = localStorage.getItem("nombre");
  let id_categoria = $(this).parents("div").parents("li").attr("data_list_id");

  let data = `nombre=${nombre}&id_todo=${id_todo}&user_id_done=${user_id}&id_categoria=${id_categoria}`;
  $.jAlert({
    title: "Completar Pendiente",
    content: "¿Está seguro de que desea marcar esta tarea como completada?",
    btns: [
      {
        text: "Si",
        theme: "dark_gray",
        onClick: function () {
          $.ajax({
            type: "POST",
            url: `${URL_WS}completetask`,
            cache: false,
            data: data,
            headers: {
              apikey,
            },
            beforeSend: function () {
              $("#loading").show();
            },
            complete: function () {
              $("#loading").hide();
            },
            success: function (data) {
              refreshTodos();
            },
          });
        },
      },
      {
        text: "No",
        theme: "black",
      },
    ],
  });
});

$(document).on("click", "#btn_guardar_todo", function (e) {
  e.preventDefault();
  const apikey = localStorage.getItem("apikey");
  const user_id = localStorage.getItem("user_id");
  var texto = $("#input_todo").val();
  var categoria = $("#select_cattodo").val();

  let data = `id_usuario=${user_id}&texto=${texto}&categoria=${categoria}`;

  if (texto != null && texto != "" && categoria != null && categoria != "") {
    $.ajax({
      cache: false,
      url: `${URL_WS}todo`,
      type: "POST",
      data: data,
      headers: {
        apikey,
      },
      beforeSend: function () {
        $("#loading").show();
      },
      complete: function () {
        $("#loading").hide();
      },
      success: function (data) {
        $("#input_todo").val("");
        refreshTodos();
      },
      error: function () {
        errorAlert("Error", "¡Hubo un error al guardar la tarea!");
      },
    });
  } else {
    errorAlert("Error", "¡Escribe el pendiente y selecciona una categoría!");
  }
});

$(document).on("click", "#btn_guardar_categoria", function (e) {
  e.preventDefault();
  const apikey = localStorage.getItem("apikey");
  const user_id = localStorage.getItem("user_id");
  var texto = $("#input_categoria").val();
  var data = `id_usuario=${user_id}&texto=${texto}`;

  if (texto != null && texto != "") {
    $.ajax({
      cache: false,
      url: `${URL_WS}categoria`,
      type: "POST",
      data: data,
      headers: {
        apikey,
      },
      beforeSend: function () {
        $("#loading").show();
      },
      complete: function () {
        $("#loading").hide();
      },
      success: function (data) {
        $("#input_categoria").val("");
        refreshCategorias();
      },
      error: function () {
        errorAlert("Error", "Hubo un error al guardar la categoría");
      },
    });
  } else {
    errorAlert("Escribe el nombre de la categoría!");
  }
});

$(document).on("click", ".btn_eliminar_categoria", function (e) {
  e.preventDefault();
  const apikey = localStorage.getItem("apikey");
  var id_cattodo = $(this).attr("data-id");

  $.jAlert({
    title: "Eliminar lista",
    content: "¿Estás seguro de que quieres eliminar la lista?",
    closeOnClick: false,
    btns: [
      {
        text: "Si",
        theme: "dark_gray",
        onClick: function () {
          $.ajax({
            cache: false,
            headers: { apikey },
            url: `${URL_WS}eliminar-cattodo/${id_cattodo}`,
            beforeSend: function () {
              $("#loading").show();
            },
            complete: function () {
              $("#loading").hide();
            },
            success: function (data) {
              if (data.status == "success") {
                successAlert(
                  "Éxito",
                  "La categoría fue eliminada exitosamente"
                );
                refreshCategorias();
              } else {
                errorAlert(
                  "Error",
                  "Lo sentimos, no puedes borrar las listas compartidas."
                );
              }
            },
            error: function () {
              errorAlert("Error", "Hubo un error!");
            },
          });
        },
      },
      {
        text: "No",
        theme: "black",
      },
    ],
  });
});

$(document).on("click", ".btn_editar_categoria", function (e) {
  e.preventDefault();
  const apikey = localStorage.getItem("apikey");
  let nombre_categoria = $(this)
    .parent()
    .siblings("td")
    .children("input")
    .val();
  let id_cattodo = $(this).attr("data-id");

  $.jAlert({
    title: "Editar el nombre de la lista",
    content:
      "¿Está seguro de que desea cambiar el nombre de la lista para todos los usuarios?",
    btns: [
      {
        text: "Si",
        theme: "dark_gray",
        onClick: function () {
          var data = `id_cattodo=${id_cattodo}&texto=${nombre_categoria}`;
          $.ajax({
            cache: false,
            type: "POST",
            url: `${URL_WS}update/cattodo`,
            data: data,
            headers: {
              apikey,
            },
            beforeSend: function () {
              $("#loading").show();
            },
            complete: function () {
              $("#loading").hide();
            },
            success: function (data) {
              successAlert("Éxito", "La categoría fue modificada exitosamente");
              refreshCategorias();
            },
          });
        },
      },
      {
        text: "No",
        theme: "black",
      },
    ],
  });
});
