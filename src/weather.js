import "babel-polyfill";
import Chart from "chart.js";
import css from './main.css';

const meteoURL = "/xml.meteoservice.ru/export/gismeteo/point/140.xml";


//Создадим массив дат
var dates = [];

//Массивы истинных температур
var max_temps = [];
var min_temps = [];

//Массивы температур "по ощущениям"
var heat_max = [];
var heat_min = [];

//Массивы для давлений
var p_max = [];
var p_min = [];

//массивы для влажности
var wet_max = [];
var wet_min = [];

//Исправим даты в подходящий формат
function correctDate(date) {
    if (date.length == 2  && date[0] == "0") {
        return date[1];
    }
    else {
        return date;
    }
}

//Устанавливаем конфигурацию графиков
function setChartConfig(elem_id, elem_type) {
    
    let chartConfig;
    let dataset;
    let gText;

    let labels = ["Максимальная температура, Цельсий",
                  "Минимальная температура, Цельсий",
                  "Максимальная температура по ощущениям, Цельсий",
                  "Минимальная температура по ощущениям, Цельсий",
                  "Максимальное давление, мм.рт.ст.",
                  "Минимальное давление, мм.рт.ст",
                  "Максимальная влажность, %",
                  "Минимальная влажность, %"
                ];

    let datas = [max_temps, min_temps, heat_max, heat_min, p_max, p_min];

    if (elem_id == 'max' && elem_type == 'T') {
        gText = "Комбинированный график зависимости максимальной температуры и по ощущениям";
        dataset = [
            {
                label: labels[0],
                backgroundColor: "rgb(255, 20, 20)",
                borderColor: "rgb(180, 0, 0)",
                data: max_temps
            },
            {
                label: labels[2],
                borderColor: "rgb(180, 150, 0)",
                data: heat_max
            }
        ]

    }
    else if (elem_id == 'max' && elem_type == 'P') {
        gText = "График зависимости максимального давления (за предсказанный период)"
        dataset = [
            {
                label: labels[4],
                backgroundColor: "rgb(86,215,152)",
                borderColor: "rgb(86,215,152)",
                data: p_max
            }
        ]
    }

    else if (elem_id == 'min' && elem_type == 'T') {
        gText = "Комбинированный график зависимости минимальной температуры и по ощущениям";
        dataset = [
            {
                label: labels[1],
                backgroundColor: "rgb(255, 20, 20)",
                borderColor: "rgb(180, 0, 0)",
                data: min_temps
            },
            {
                label: labels[3],
                borderColor: "rgb(180, 150, 0)",
                data: heat_min
            }
        ]
    }

    else if (elem_id == 'min' && elem_type == 'P') {
        gText = "График зависимости минимального давления (за предсказанный период)"
        dataset = [
            {
                label: labels[5],
                backgroundColor: "rgb(86,215,152)",
                borderColor: "rgb(86,215,152)",
                data: p_min
            }
        ]
    }
    else if (elem_id == 'max' && elem_type == 'W') {
        gText = "График зависимости максимальной влажности (за предсказанный период)"
        dataset = [
            {
                label: labels[6],
                backgroundColor: "rgb(243,139,74)",
                borderColor: "rgb(243,139,74)",
                data: wet_max
            }
        ]
    }
    else if (elem_id == 'min' && elem_type == 'W') {
        gText = "График зависимости минимальной влажности (за предсказанный период)"
        dataset = [
            {
                label: labels[7],
                backgroundColor: "rgb(243,139,74)",
                borderColor: "rgb(243,139,74)",
                data: wet_min
            }
        ]
    }
    
    chartConfig = {
        type: "line",
    
        data: {
          labels: dates,
          datasets: dataset,
        },
        options: {
          title: {
              display: true,
              text: gText
          },

          layout: {
              padding: {
                  left: 50,
                  right: 0,
                  top: 50,
                  bottom: 0
              }
          }
      }
      };
    return chartConfig;
}

//Загружаем данные
async function loadData() {
    //получаем ответ на запрос
    const response = await fetch(meteoURL);
    const responseText = await response.text();

    //пропускаем через парсер
    const parsedData = new DOMParser().parseFromString(responseText, "text/xml");
    //console.log(parsedData);

    //извлекаем прогнозы
    const forecasts = parsedData.querySelectorAll("FORECAST")
    console.log(forecasts)

    for (let i = 0; i < forecasts.length; i++) {
        //Создаем ось Х (даты)
        const forecast = forecasts.item(i);
        const year = forecast.getAttribute("year");
        const mounth = correctDate(forecast.getAttribute("month"));
        const day = correctDate(forecast.getAttribute("day"));
        const hour = correctDate(forecast.getAttribute("hour"));
        var date = new Date(year, mounth, day, hour);
        var newdate = date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate() + "  " + date.getHours()+':00';

        dates[i] = (newdate)
        //console.log(dates);

        //парсим температуры
        max_temps[i] = (forecast.childNodes["5"].getAttribute("max"));
        heat_max[i] = (forecast.childNodes["11"].getAttribute("max"));
        min_temps[i] = (forecast.childNodes["5"].getAttribute("min"));
        heat_min[i] = (forecast.childNodes["11"].getAttribute("min"));

        p_max[i] = (forecast.childNodes["3"].getAttribute("max"));
        p_min[i] = (forecast.childNodes["3"].getAttribute("min"));

        wet_max[i] = (forecast.childNodes["9"].getAttribute("max"));
        wet_min[i] = (forecast.childNodes["9"].getAttribute("min"));
      }
    
    console.log(p_max)
}

const buttonBuild = document.getElementById("btn");
const canvasTemp = document.getElementById("temperature").getContext("2d");
const canvasPress = document.getElementById("pressure").getContext("2d");
const canvasWet = document.getElementById("wet").getContext("2d");
//console.log(elem);

buttonBuild.addEventListener("click", async function() {
    //загружаем данные
    await loadData();

    let tab = document.getElementById('tabs');
    tab.style.display = 'table';

    //отображаем вкладки
    let ulli = document.querySelectorAll('ul li');
    for (let i=0; i<ulli.length; i++){
        ulli[i].style.display = "inline-block";
    }

    let t_max = document.getElementById('max');
    console.log(t_max.id);
    let t_min = document.getElementById('min');


    t_max.onclick = function() {
         new Chart(canvasTemp, setChartConfig(t_max.id, "T"));
         new Chart(canvasPress, setChartConfig(t_max.id, "P"));
         new Chart(canvasWet, setChartConfig(t_max.id, "W"));
    }

    t_min.onclick = function() {
        new Chart(canvasTemp, setChartConfig(t_min.id, "T"));
        new Chart(canvasPress, setChartConfig(t_min.id, "P"));
        new Chart(canvasWet, setChartConfig(t_min.id, "W"));
    }

    window.chart = new Chart(canvasTemp, setChartConfig(t_max.id, "T"));
    window.chart = new Chart(canvasPress, setChartConfig(t_max.id, "P"));
    window.chart = new Chart(canvasWet, setChartConfig(t_max.id, "W"));

  });