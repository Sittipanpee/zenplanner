' Summary Dashboard Generator
' Auto-generate summary from all sheets

Sub GenerateSummaryDashboard()
    Dim ws As Worksheet
    Dim summaryWs As Worksheet
    Dim lastRow As Long
    Dim i As Long
    Dim sheetNames As String
    
    ' Create or get Summary sheet
    On Error Resume Next
    Set summaryWs = ThisWorkbook.Worksheets("Summary")
    If summaryWs Is Nothing Then
        Set summaryWs = ThisWorkbook.Worksheets.Add(Before:=ThisWorkbook.Worksheets(1))
        summaryWs.Name = "Summary"
    End If
    On Error GoTo 0
    
    With summaryWs
        .Clear
        
        ' Header
        .Range("A1").Value = "ZenPlanner Summary"
        .Range("A1").Font.Size = 24
        .Range("A1").Font.Bold = True
        .Range("A1").Font.Color = RGB(124, 154, 130) ' zen-sage
        
        .Range("A3").Value = "Sheet Name"
        .Range("B3").Value = "Tasks Done"
        .Range("C3").Value = "Tasks Pending"
        .Range("D3").Value = "Completion"
        
        .Range("A3:D3").Font.Bold = True
        .Range("A3:D3").Interior.Color = RGB(245, 243, 238) ' zen-bg
        
        ' Loop through all worksheets except Summary
        i = 4
        For Each ws In ThisWorkbook.Worksheets
            If ws.Name <> "Summary" Then
                .Cells(i, 1).Value = ws.Name
                
                ' Count "Done" in column D (Status)
                On Error Resume Next
                lastRow = ws.Cells(ws.Rows.Count, "D").End(xlUp).Row
                If lastRow > 1 Then
                    Dim doneCount As Long
                    Dim pendingCount As Long
                    
                    doneCount = Application.WorksheetFunction.CountIf(ws.Range("D2:D" & lastRow), "Done")
                    pendingCount = Application.WorksheetFunction.CountIf(ws.Range("D2:D" & lastRow), "Pending")
                    
                    .Cells(i, 2).Value = doneCount
                    .Cells(i, 3).Value = pendingCount
                    
                    If doneCount + pendingCount > 0 Then
                        .Cells(i, 4).Value = doneCount / (doneCount + pendingCount)
                        .Cells(i, 4).NumberFormat = "0%"
                    End If
                End If
                On Error GoTo 0
                
                i = i + 1
            End If
        Next ws
        
        ' Auto-fit columns
        .Columns("A:D").AutoFit
        
        ' Add color coding to completion column
        Dim completionRng As Range
        Set completionRng = .Range("D4:D" & i - 1)
        With completionRng
            .FormatConditions.Delete
            .FormatConditions.Add Type:=xlCellValue, Operator:=xlGreater, Formula1:="=0.8"
            .FormatConditions(1).Interior.Color = RGB(124, 154, 130) ' zen-sage
            .FormatConditions.Add Type:=xlCellValue, Operator:=xlLess, Formula1:="=0.5"
            .FormatConditions(2).Interior.Color = RGB(212, 131, 127) ' zen-blossom
        End With
    End With
    
    MsgBox "Summary dashboard generated!", vbInformation
End Sub
