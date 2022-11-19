$(document).ready(function () {
  setActiveMenu();

  setTheme(localStorage.getItem("theme"));

  $(".theme-links a").click(function () {
    setTheme($(this).parent().attr("id"));
  });
});

function getUrlParameter(param) {
  var url = window.location.search.substring(1),
    urlVariables = url.split("&"),
    parameterName,
    i;

  for (i = 0; i < urlVariables.length; i++) {
    parameterName = urlVariables[i].split("=");

    if (parameterName[0] === param) {
      return typeof parameterName[1] === undefined
        ? true
        : decodeURIComponent(parameterName[1]);
    }
  }
  return false;
}

function setTheme(theme) {
  console.log(theme);
  localStorage.setItem("theme", theme);
  document.documentElement.className = theme;
}

function setActiveMenu() {
  // Get current page URL
  var url = window.location.href;

  // remove # from URL
  url = url.substring(
    0,
    url.indexOf("#") == -1 ? url.length : url.indexOf("#")
  );

  // remove parameters from URL
  url = url.substring(
    0,
    url.indexOf("?") == -1 ? url.length : url.indexOf("?")
  );

  // select file name
  url = url.substr(url.lastIndexOf("/") + 1);

  if (
    ["entree.html", "salad.html", "dessert.html", "drinks.html"].includes(url)
  ) {
    url = "menu.html";
  }

  // If file name not avilable
  if (url == "") {
    url = "index.html";
  }

  // Loop all menu items
  $(".topnav a").each(function () {
    // select href
    var href = $(this).attr("href");

    // Check filename
    if (url == href) {
      // Add active class
      $(this).addClass("active");
    }
  });
}

function validateReservationForm(e) {
  e.preventDefault();
  var msg = "";
  var myform = document.forms["reservation_form"];
  var full_name = myform.full_name.value;
  var phone = myform.phone.value;
  var days = myform.days.value;
  var time = myform.time.value;
  var persons_num = myform.persons_num.value;

  if (full_name == "") {
    msg = "    * Name\n";
  }
  if (phone == "") {
    msg = "    * Phone\n";
  }
  if (days == "") {
    msg = "    * Day\n";
  }
  if (time == "") {
    msg = "    * Time\n";
  }
  if (persons_num == "") {
    msg = "    * Number of persons\n";
  }

  if (msg != "") {
    alert("These fileds must be filled out \n" + msg);
    return false;
  }

  var r2 =
    /^((\+[1-9]{1,4}[ \-]*)|(\([0-9]{2,3}\)[ \-]*)|([0-9]{2,4})[ \-]*)*?[0-9]{3,4}?[ \-]*[0-9]{3,4}?$/;
  if (!r2.test(phone)) {
    alert("Phone must be 9 digits.");
    return false;
  }

  document.forms["reservation_form"].action = "find.html";
  document.forms["reservation_form"].submit();
  return true;
}

function checkAvailableTables() {
  var persons_num = parseInt(getUrlParameter("persons_num"));
  console.log(persons_num);
  var booked_tables = [];
  for (var i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i).includes("book_")) {
      var booked_table_num = localStorage.key(i).replace("book_", "");
      booked_tables.push(parseInt(booked_table_num));
    }
  }
  $(".box-container1 .table-picture").each(function () {
    var $btn = $(this).find(".BOOK");
    var $img = $(this).find("img");
    var capacity = parseInt($(this).find(".table-capacity span").text());
    var table_num = parseInt($(this).find(".table-num span").text());
    if (booked_tables.includes(table_num)) {
      var name = JSON.parse(localStorage.getItem('book_' + table_num))[1];
      $btn.click(function () {
        alert('Already booked by ' + name + '!');
      });
      $img.css({"filter": "opacity(0.3)"});
      $btn.siblings('.table-capacity').append(' (Already booked by ' + name +')');
    } 
    else if (capacity < persons_num) {
      $btn.click(function () {
        alert('Table capacity is insufficient!');
      });
      $img.css({"filter": "opacity(0.3)"});
      $btn.siblings('.table-capacity').append(' (Insufficient)');
    }
    else
      $btn.click(function () {
        console.log('asdf');
        if (bookTable(table_num)) {
          $(this).attr("disabled", "disabled");
          window.location.href = "order.html";
        }
      });
  });
}

var invoice_items = [];

function getAvailableTables() {
  var $order_table_form = $("#order_table_form");
  var $select = $order_table_form.find("select");

  $order_table_form.find("button").click(function () {
    addOrder();
  });

  $select.html("");
  $select.append('<option value="0"> Select table</option>');
  for (var i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i).includes("book_")) {
      var table_num = localStorage.key(i).replace("book_", "");
      $select.append(
        '<option value="' + table_num + '"> Table[' + table_num + "]</option>"
      );
    }
  }

  $(".box .btn").click(function () {
    var item_name = $(this).parent().find("h3").text();
    var item_price = $(this).parent().find("span").text().replace("RS", "");
    var item_quantity = $(this).parent().find("input").val();

    if (item_quantity == "") {
      alert("Add Quantity");
    } else {
      invoice_items.push([
        item_name,
        parseInt(item_price),
        parseInt(item_quantity),
      ]);
      var item_total = parseInt(item_price) * parseInt(item_quantity); 
      $("#order-details").append('<tr><td>' + item_name + '</td><td>' + item_quantity + '</td><td class="product-price" data-price="' + item_total + '">' + item_total + ' RS</td></tr>');
    }
  });

  $("#invoices_table tbody").html("");
}

function bookTable(table_nam) {
  var full_name = getUrlParameter("full_name");
  var phone = getUrlParameter("phone");
  var days = getUrlParameter("days");
  var time = getUrlParameter("time");
  var persons_num = getUrlParameter("persons_num");

  var bookInfo = [table_nam, full_name, phone, days, time, persons_num];

  var r = confirm("Do you want to book for this info: " + bookInfo);
  if (r == true) {
    localStorage.setItem("book_" + table_nam, JSON.stringify(bookInfo));
    return true;
  } else {
    return false;
  }
}

function addOrder() {
  var table_nam = parseInt($("#order_table_form select").val());
  if (table_nam == 0) alert("Select table");
  else {
    var $invoices_tbody = $("#invoices_table tbody");
    var btn =
      '<input class="print" type="button" onclick="printInvoice(this, ' +
      table_nam +
      ')" value="print invoice "/>';
    var total = 0;

    for (var i = 0; i < invoice_items.length; i++)
      total += parseInt(invoice_items[i][1]) * parseInt(invoice_items[i][2]);

    var tr =
      "<tr><td>" +
      table_nam +
      "</td><td>" +
      total +
      " RS</td><td>" +
      btn +
      "</td></tr>";

    $invoices_tbody.append(tr);
    localStorage.setItem("invoice_" + table_nam, JSON.stringify(invoice_items));

    $("#order_table_form option[value='" + table_nam + "']").each(function () {
      $(this).remove();
    });
    $("#order-details").empty();
  }
}

function printInvoice(e, table_nam) {
  var tr = $(e).parent().parent();

  var items = JSON.parse(localStorage.getItem("invoice_" + table_nam));

  var total = 0;
  invoice = $(
    '<div class="order-table"><table><thead><tr><th>Item</th><th>Quantity</th><th>Price</th></tr></thead><tbody></tbody></table></div>'
  );

  for (var i = 0; i < items.length; i++) {
    item_name = items[i][0];
    item_quantity = items[i][1];
    item_price = items[i][2];
    total += parseInt(item_quantity) * parseInt(item_price);
    tr = $(
      "<tr><td>" +
        item_name +
        "</td><td>" +
        item_quantity +
        "</td><td>" +
        item_price +
        " RS</td></tr>"
    );
    tr.appendTo(invoice.find("tbody"));
  }

  tr = $("<tr><td>Total</td><td>" + total + "</td><td></td></tr>");
  tr.appendTo(invoice.find("tbody"));

  var win = window.open("", "Print-Window");

  win.document.open();

  win.document.write(
    '<html><body onload="window.print()">' + invoice.html() + "</body></html>"
  );

  win.document.close();

  setTimeout(function () {
    win.close();
  }, 10);

  localStorage.removeItem("book_" + table_nam);
  localStorage.removeItem("invoice_" + table_nam);

  $(e).parent().parent().remove();
}


function updateStaffRating(elem, star) {
    elem = $(elem);
    $(elem).find('.rating-total').html(star.toFixed(1));
    $(elem).find(".stars").children().each(function(){
        var index = $(this).index();
        if (index == 5 - Math.round(star)) {
            $(this).siblings().removeClass("is-selected");
            $(this).addClass("is-selected");
        }
    });
}

function getStaffRating() {

    $(".box-container .box").each(function () {
        var staff_index = $(this).attr("id");

        var staff_rating = JSON.parse(localStorage.getItem("staff_rating_" + staff_index) || '[]');
        staff_rating = (staff_rating.reduce((a, b) => a + b, 0) / staff_rating.length) || 0;

        if (staff_rating != null || staff_rating != undefined) {
            updateStaffRating($(this), staff_rating);
          }
      });

      $(".stars").on("click", function (e) {
        $(e.target).siblings().removeClass("is-selected");
        $(e.target).addClass("is-selected");

          var staff_index = $(e.target).parent().parent().index();
          var staff_rating = JSON.parse(localStorage.getItem("staff_rating_" + staff_index) || '[]');
          var star = $(e.target).index();


          staff_rating.push(5 - star);
          var avg = (staff_rating.reduce((a, b) => a + b, 0) / staff_rating.length) || 0;
          localStorage.setItem("staff_rating_" + staff_index, JSON.stringify(staff_rating));
          $('#rating' + (staff_index + 1)).html(avg.toFixed(1));
          $(e).find(".stars").each(function(e){
              var index = $(e.target).index();
              if (index == 5 - Math.round(avg)) {
                  $(e.target).siblings().removeClass("is-selected");
                  $(e.target).addClass("is-selected");
              }
          });
      });

    var $order_table_form = $("#order_table_form");
    var $select = $order_table_form.find("select");
  
    $order_table_form.find("button").click(function () {
      addOrder();
    });
  
    $select.html("");
    $select.append('<option value="0"> Select table</option>');
    for (var i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i).includes("book_")) {
        var table_num = localStorage.key(i).replace("book_", "");
        $select.append(
          '<option value="' + table_num + '"> Table[' + table_num + "]</option>"
        );
      }
    }
  
    $(".box .btn").click(function () {
      var item_name = $(this).parent().find("h3").text();
      var item_price = $(this).parent().find("span").text().replace("RS", "");
      var item_quantity = $(this).parent().find("input").val();
  
      if (item_quantity == "") {
        alert("Add Quantity");
      } else {
        invoice_items.push([
          item_name,
          parseInt(item_price),
          parseInt(item_quantity),
        ]);
        console.log(invoice_items);
      }
    });
  
    $("#invoices_table tbody").html("");
  }

$("#phone").on("keypress", function (evt) {
    if (evt.which < 48 || evt.which > 57)
    {
        evt.preventDefault();
    }
});

$("#full_name").on("keypress", function (evt) {
  if (/\d/.test(evt.key))
  {
      evt.preventDefault();
  }
});

function sortItems() {
  var table, rows, switching, i, x, y, shouldSwitch;
  tables = document.getElementsByClassName("box-container");

  for (var j = 0; j < tables.length; j++) {
    table = tables[j];

    switching = true;
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
      // Start by saying: no switching is done:
      switching = false;
      rows = table.children;
      /* Loop through all table rows (except the
      first, which contains table headers): */
      for (i = 0; i < (rows.length - 1); i++) {
        // Start by saying there should be no switching:
        shouldSwitch = false;
        /* Get the two elements you want to compare,
        one from current row and one from the next: */
        x = $(rows[i]).data('price');
        y = $(rows[i + 1]).data('price');
        // Check if the two rows should switch place:
        if (Number(x) > Number(y)) {
          // If so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
      if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
  }
}