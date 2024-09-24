let firstNumber = "0";
let secondNumber = "";
let operator = "";
let resetDisplay = false;
let history = "0";
const display = document.querySelector("#display");
const historyDisplay = document.querySelector("#historyDisplay");
const messageDisplay = document.querySelector("#messageDisplay");
const decimalButton = document.querySelector("#decimal");

// 添加键盘事件监听器
document.addEventListener("keydown", function (event) {
  const key = event.key;
  if (key >= "0" && key <= "9") {
    appendChar(key); //
  } else if (
    key === "." ||
    (event.code === "NumpadDecimal" && !decimalButton.disabled)
  ) {
    appendChar("."); // 小数点或数字键盘的小数点调用appendChar函数
  } else if (key === "Backspace") {
    removeChar(); // 退格键调用removeChar函数
  } else if (key === "+" || key === "-" || key === "*" || key === "/") {
    const opMap = { "+": "+", "-": "-", "*": "×", "/": "÷" };
    appendOperator(opMap[key]); // 运算符键调用appendOperator函数
  } else if (key === "Enter") {
    event.preventDefault(); // 阻止默认行为
    operate(); // 回车键调用operate函数
  } else if (key.toLowerCase() === "c") {
    resetCalculator(); // C键调用resetCalculator函数
  } else if (key === "%") {
    calculatePercentage(); // 百分号键调用calculatePercentage函数
  } else if (key === "s") {
    changeSign(); // S键调用changeSign函数
  }
});

function appendChar(char) {
  // 清空错误信息显示
  initialMessageDisplay();

  // 如果需要重置显示器或者当前值为“0”且输入字符不是“.”，则清空显示屏
  if (resetDisplay || (display.value === "0" && char !== ".")) {
    display.value = "";
    resetDisplay = false;
  }

  if (display.value === "" && char === ".") {
    display.value = "0"; // 如果显示屏为空且输入字符是“.”，则添加“0”到显示屏
  }

  if (display.value.length === 28) {
    showErrorMessage("Error: max input length reached");
    return;
  }
  if (firstNumber.includes("e")) {
    showErrorMessage("Error: scientific notation is not editable");
    return; // 科学计数法后面不能直接添加数字，直接返回
  }
  display.value += char; // 将当前输入字符添加到显示屏

  if (!operator) {
    firstNumber = display.value; // 如果没有操作符，则将当前值存储为第一个运算数
  } else {
    secondNumber = display.value; // 否则，将当前值存储为第二个运算数
  }

  // 如果显示屏中包含小数点，则禁用小数点按钮
  if (display.value.includes(".")) {
    decimalButton.disabled = true;
  } else {
    decimalButton.disabled = false;
  }

  updateLastLineInHistoryDisplay(); // 更新历史记录显示
}

// 删除字符的函数
function removeChar() {
  // 清空信息显示
  initialMessageDisplay();

  // 如果需要重置显示器，则清空显示屏
  if (resetDisplay) {
    display.value = ""; // 重置显示屏
    resetDisplay = false; //重置显示器的标志
  }

  if (secondNumber !== "") {
    if (secondNumber.includes("e")) {
      // 如果第二个运算数包含“e”
      secondNumber = deleteCharInScientificNotation(secondNumber); // 删除科学计数法中的字符
      display.value = secondNumber; // 显示第二个运算数
    } else {
      secondNumber = secondNumber.slice(0, -1); // 删除第二个运算数的最后一个字符
      let lastChar = secondNumber.slice(-1); // 获取第二个运算数的最后一个字符
      if (lastChar === "-" || lastChar === "") {
        secondNumber = ""; // 如果最后一个字符是负号，则清空第二个运算数
        display.value = "0"; // 显示“0”
      } else {
        display.value = secondNumber; // 显示第二个运算数
      }
    }
  } else if (secondNumber == "" && operator) {
    // 如果第二个运算数为空并且有操作符
    operator = ""; // 清空操作符
    display.value = firstNumber; // 显示第一个运算数
  } else {
    if (firstNumber.includes("e")) {
      // 如果第一个运算数包含“e”
      firstNumber = deleteCharInScientificNotation(firstNumber); // 删除科学计数法中的字符
    } else {
      firstNumber = display.value.slice(0, -1); // 删除最后一个字符

      if (firstNumber === "" || firstNumber === "-") {
        firstNumber = "0";
      }
    }
    display.value = firstNumber; // 显示第一个运算数
  }

  // 小数点按钮控制
  if (!display.value.includes(".")) {
    decimalButton.disabled = false;
  }

  updateLastLineInHistoryDisplay();
}

// 处理操作符输入的函数
function appendOperator(op) {
  // 清空信息显示
  initialMessageDisplay();

  // 如果显示屏最后一个字符是“.”，添加“0”
  if (display.value.endsWith(".")) {
    display.value = display.value.slice(0, -1); // 删除最后一个字符
    history = history.slice(0, -1); // 删除历史记录的最后一个字符
    if (!operator) {
      firstNumber = display.value; // 如果没有操作符，则设置0到第一个运算数
    } else {
      secondNumber = display.value; // 否则，设置0到第二个运算数
    }
  }

  firstNumber = replaceOccurrenceInLastLine(firstNumber); // 替换最后一行中的原始值为新值
  display.value = firstNumber; // 更新显示屏

  if (operator && secondNumber !== "") {
    operate();
  }

  operator = op; // 设置新的操作符
  resetDisplay = true; // 标志为下次输入时重置显示器

  const lastChar = history.trim().slice(-1); // 获取历史记录的最后一个字符
  if (["+", "-", "×", "÷"].includes(lastChar)) {
    history = history.slice(0, -3) + ` ${op} `; // 当重复输入运算符，在历史记录里替换最后的操作符
  } else {
    history += ` ${op} `; // 否则，添加新的操作符
  }

  historyDisplay.value = history; // 更新历史记录显示
  historyDisplay.scrollTop = historyDisplay.scrollHeight; // 历史记录显示器自动滚动到底部
}

function calculatePercentage() {
  // 清空信息显示
  initialMessageDisplay();

  if (
    display.value === "ERROR" ||
    display.value === "Infinity" ||
    display.value === "-Infinity"
  ) {
    return; // 如果显示屏为“ERROR”，“Infinity正无穷”或者为“-Infinity负无穷”，直接返回
  }

  if (secondNumber === "" && operator !== "") {
    showErrorMessage("Error: no second number dectected"); // 显示错误信息
    return; // 如果没有第二个运算数并且有操作符，直接返回
  }

  let percentageResult = 0;
  if (secondNumber === "") {
    const a = parseFloat(firstNumber);
    percentageResult = a / 100;
    display.value = percentageResult; // 显示结果
  } else {
    if (operator === "×" || operator === "÷") {
      showErrorMessage("Error: percentage is not supported for × and ÷"); // 显示错误
      return; // 如果操作符是“×”或者“÷”，直接返回
    }

    secondNumber = replaceOccurrenceInLastLine(secondNumber); // 替换最后一行中的原始值为新值

    const a = parseFloat(firstNumber);
    const b = parseFloat(secondNumber);

    percentageResult = calcPercentage(a, b, operator); // 计算百分比
  }

  history += ` % = ${percentageResult}\n\n${percentageResult}`;
  historyDisplay.value = history;
  historyDisplay.scrollTop = historyDisplay.scrollHeight; // 历史记录显示器自动滚动到底部

  firstNumber = percentageResult.toString(); // 更新第一个运算数（结果）
  secondNumber = ""; // 重置
  operator = ""; // 重置
  display.value = percentageResult.toString();

  // 处理小数点按钮
  if (percentageResult.toString().includes(".")) {
    decimalButton.disabled = true;
  } else {
    decimalButton.disabled = false;
  }
}

// 处理+/-的函数, 改变当前值的正负
function changeSign() {
  initialMessageDisplay();

  if (
    display.value === "0" ||
    display.value === "ERROR" ||
    display.value === "Infinity" ||
    display.value === "-Infinity"
  )
    return;
  if (operator && secondNumber !== "" && display.value !== "0") {
    secondNumber = (parseFloat(secondNumber) * -1).toString();
    display.value = secondNumber;
  } else if (!operator && firstNumber !== "0") {
    firstNumber = (parseFloat(firstNumber) * -1).toString();
    display.value = firstNumber;
  } else {
    return; // 否则，直接返回
  }

  updateLastLineInHistoryDisplay(); // 更新历史记录显示
}

function resetCalculator() {
  // 清空信息显示
  initialMessageDisplay();
  firstNumber = "0";
  secondNumber = "";
  operator = "";
  resetDisplay = false;
  display.value = "0";
  decimalButton.disabled = false;
  history = "0"; // 重置历史记录
  historyDisplay.value = "0"; // 重置历史记录显示
}

// 清空历史记录的函数
function initialMessageDisplay() {
  messageDisplay.style.color = "rgb(84, 84, 84)"; // 设置消息显示的颜色为灰色
  messageDisplay.value = "Calculator - Made By Yali 😜"; // 清空信息显示
}

function showErrorMessage(message) {
  messageDisplay.style.color = "red";
  messageDisplay.value = message; // 显示错误信息
}

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    return "ERROR";
  }
  return a / b;
}

function calcPercentage(a, b, operator) {
  switch (operator) {
    case "+":
      return a + a * (b / 100);
    case "-":
      return a - a * (b / 100);
  }
}

// 格式化数字
function formatNumber(num) {
  let parsed = parseFloat(num); // 将字符串转换为浮点数同时会去掉比如：1.2300000后面的0，会返回1.23
  return parsed.toString();
}

// 执行计算的函数
function operate() {
  // 清空错误信息显示
  initialMessageDisplay();

  if (!operator) {
    showErrorMessage("Error: no operator dectected");
    return;
  }

  if (secondNumber === "") {
    showErrorMessage("Error: no second number dectected");
    return;
  }

  if (display.value.endsWith(".")) {
    // 处理小数点，如果最后一个字符是“.”
    display.value = display.value.slice(0, -1); // 删除最后一个字符
    history = history.slice(0, -1); // 删除历史记录的最后一个字符
  }

  secondNumber = replaceOccurrenceInLastLine(secondNumber); // 替换最后一行中的原始值为新值

  // 将字符串转换为浮点数进行计算
  const a = parseFloat(firstNumber);
  const b = parseFloat(secondNumber);
  var result = "0"; // 初始化计算结果

  switch (operator) {
    case "+":
      result = add(a, b);
      break;
    case "-":
      result = subtract(a, b);
      break;
    case "×":
      result = multiply(a, b);
      break;
    case "÷":
      result = divide(a, b);
      break;
  }

  // 如果出现错误或者结果为无穷大，则重置显示器
  if (result === "ERROR" || result === Infinity || result === -Infinity) {
    if (result === "ERROR") {
      showErrorMessage("Error: division by zero");
    }
    resetDisplay = true;
    firstNumber = "0";
  } else {
    firstNumber = result.toString();
  }

  history += ` = ${result}\n\n`; // 添加计算结果到历史记录，每次计算结果后换行

  // 更新第一个运算数（结果）到历史记录
  if (result === "ERROR" || result === Infinity || result === -Infinity) {
    history += "0"; // 如果出现错误或者结果为无穷大，添加“0”到历史记录
  } else {
    history += `${result}`;
  }

  historyDisplay.value = history;
  historyDisplay.scrollTop = historyDisplay.scrollHeight; // 历史记录显示器自动滚动到底部

  secondNumber = "";
  operator = "";
  display.value = result.toString();

  // 处理小数点按钮， 如果结果包含小数点，禁用小数点按钮
  if (result.toString().includes(".")) {
    decimalButton.disabled = true;
  } else {
    decimalButton.disabled = false;
  }
}

// 更新历史记录最后一行显示的函数
function updateLastLineInHistoryDisplay() {
  let lines = history.split("\n"); // 按换行符分割历史记录，返回数组
  let lastLine = lines[lines.length - 1]; // 获取最后一行

  if (secondNumber === "") {
    if (operator) {
      lastLine = `${firstNumber} ${operator} `;
    } else {
      lastLine = firstNumber;
    }
  } else {
    lastLine = `${firstNumber} ${operator} ${secondNumber}`;
  }

  lines[lines.length - 1] = lastLine; // 更新历史记录的最后一行
  history = lines.join("\n"); // 重新组合历史记录，用换行符连接
  historyDisplay.value = history; // 更新历史记录显示
  historyDisplay.scrollTop = historyDisplay.scrollHeight;
}

// 替换最后一行中的原始值为新值
function replaceOccurrenceInLastLine(originalValue) {
  let tempNumber = originalValue; // 保存原始值
  originalValue = formatNumber(originalValue); // 格式化原始值
  if (tempNumber !== originalValue) {
    // 如果原始值有变
    let lines = history.trim().split("\n");
    let lastLine = lines[lines.length - 1]; // 获取最后一行

    const lastOccurrenceIndex = lastLine.lastIndexOf(tempNumber); // 查找最后一个出现的原始值

    if (lastOccurrenceIndex !== -1) {
      // 如果找到
      const updatedLastLine =
        lastLine.slice(0, lastOccurrenceIndex) +
        originalValue +
        lastLine.slice(lastOccurrenceIndex + tempNumber.length); // 替换最后一个出现的原始值为新值

      if (updatedLastLine.endsWith(".")) {
        updatedLastLine.value = updatedLastLine.value.slice(0, -1); // 删除最后一个字符
      }

      // 更新最后一行
      lines[lines.length - 1] = updatedLastLine;
      history = lines.join("\n"); // 重新组合历史记录
      historyDisplay.value = history; // 更新历史记录显示
      historyDisplay.scrollTop = historyDisplay.scrollHeight;
    }
  }

  return originalValue; // 返回新值
}

// 删除科学计数法中的字符
function deleteCharInScientificNotation(numberStr) {
  let number = parseFloat(numberStr);
  if (number.toString().includes("e")) {
    // 如果浮点数包含“e”
    let [base, exponent] = number.toExponential().split("e"); // 将浮点数转换为科学计数法
    exponent = parseInt(exponent); // 将指数转换为整数
    if (exponent !== 0) {
      if (exponent > 0) {
        exponent -= 1;
      } else {
        exponent += 1;
      }
      return `${base}e${exponent >= 0 ? "+" : ""}${exponent}`;
    }
  } else {
    // 如果不包含“e”，（防止科学计数法转回为正常数时，比如小于12位数的时候，直接返回为正常的浮点数）直接返回。将数字转换为更简洁的字符串表示形式，避免出现不必要的小数点和零。
    numberStr = number.toFixed(12).replace(/\.?0+$/, "");
  }
  return numberStr;
}
