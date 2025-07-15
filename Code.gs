function doGet() {
  const template = HtmlService.createTemplateFromFile('index');

  template.course = "CSE250";
  template.semester = "Summer 2025";
  template.section = "4, 19";

  return template.evaluate();
}

function getMarks(assessment, id, code) {
  const markSpreadsheetId = "1mFAl5wSJOSldxTe1c......";
  const assessmentSheet = SpreadsheetApp.openById(markSpreadsheetId).getSheetByName(assessment);
  const publishStatus = assessmentSheet.getRange("A1").getValue();

  if(publishStatus !== "Publish ✔") {
    let messageStr;
    if(assessment === "Grade") {
      messageStr = "Course grade is not available yet";
    }
    else {
      messageStr = assessment + " marks have not been published yet";
    }
    return {
      isSuccess: false,
      message: messageStr,
    };
  }

  const uniqueCode = SpreadsheetApp.openById(markSpreadsheetId).getSheetByName("Unique Code").getRange("F3:F").getValues();
  const rawData = assessmentSheet.getDataRange().getValues();
  
  const headers = [];
  const outOfMarks = [];
  const data = [];
  const nonBlankColNo = [];
  let solutionLink;
  let noSolution = 1;
  
  for(let i=0; i<rawData[0].length; i++) {
    if(rawData[0][i] !== "" && rawData[0][i] !== null && rawData[0][i] !== " " && !rawData[0][i].toString().trim().includes("~")) {
      headers.push(rawData[0][i]);
      outOfMarks.push(rawData[2][i]);
      nonBlankColNo.push(i);
    }
  }

  if(headers.findIndex(header => header.includes("Solution")) !== -1) {
    noSolution = 0;
    solutionLink = outOfMarks[outOfMarks.length-1];
  }

  for(let i=0; i<rawData.length; i++) {
    data[i] = [];
    for(let j=0; j<nonBlankColNo.length; j++) {
      data[i][j] = rawData[i][nonBlankColNo[j]];
    }
  }

  let name;
  const marksObj = {};
  const outOfMarksObj = {};
  const orderedKeysToShow = headers.slice(5, headers.length-1+noSolution);

  for(let i=3; i<data.length; i++) {
    if(id === data[i][2].toString().trim() && code === uniqueCode[i-3][0].toString().trim()) {
      name = data[i][3];

      for(let j=5; j<(headers.length-1+noSolution); j++) {
        if(!isNaN(data[i][j]) && typeof Number(data[i][j]) === 'number') {
          marksObj[headers[j]] = Math.trunc(data[i][j]*100)/100;
        }
        else {
          marksObj[headers[j]] = data[i][j];
        }
        outOfMarksObj[headers[j]] = outOfMarks[j];
      }

      return {
          isSuccess: true,
          name,
          marksObj,
          outOfMarksObj,
          solutionLink,
          orderedKeysToShow
      };
    }
  }
  return {
    isSuccess: false,
    message: "Student ID or code doesn't match!",
  };
}
