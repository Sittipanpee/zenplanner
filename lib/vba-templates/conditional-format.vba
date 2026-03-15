' Conditional Formatting for ZenPlanner
' Add color coding based on cell values

Sub ApplyConditionalFormatting()
    Dim ws As Worksheet
    Dim rng As Range
    
    ' Apply to each worksheet with "Status" column
    For Each ws In ThisWorkbook.Worksheets
        On Error Resume Next
        Set rng = ws.Range("D:D") ' Assuming Status is in column D
        
        ' Clear existing conditional formatting
        rng.FormatConditions.Delete
        
        ' Add conditional formatting rules
        ' Green for "Done"
        rng.FormatConditions.Add Type:=xlCellValue, Operator:=xlEqual, Formula1:="=""Done"""
        rng.FormatConditions(1).Interior.Color = RGB(124, 154, 130) ' zen-sage
        
        ' Yellow for "In Progress"
        rng.FormatConditions.Add Type:=xlCellValue, Operator:=xlEqual, Formula1:="=""In Progress"""
        rng.FormatConditions(2).Interior.Color = RGB(201, 169, 110) ' zen-gold
        
        ' Red for "Overdue"
        rng.FormatConditions.Add Type:=xlCellValue, Operator:=xlEqual, Formula1:="=""Overdue"""
        rng.FormatConditions(3).Interior.Color = RGB(212, 131, 127) ' zen-blossom
        
        On Error GoTo 0
    Next ws
    
    MsgBox "Conditional formatting applied!", vbInformation
End Sub
