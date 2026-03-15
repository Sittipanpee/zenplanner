' Dropdown Shortcuts for Quick Entry
' Add data validation dropdowns

Sub AddDropdownShortcuts()
    Dim ws As Worksheet
    Dim rng As Range
    
    ' Status dropdown values
    Dim statusValues As String
    statusValues = "Pending,In Progress,Done,Skipped"
    
    ' Priority dropdown values
    Dim priorityValues As String
    priorityValues = "High,Medium,Low"
    
    ' Mood dropdown values
    Dim moodValues As String
    moodValues = "😫,😕,😐,🙂,😄"
    
    For Each ws In ThisWorkbook.Worksheets
        On Error Resume Next
        
        ' Add Status dropdown in column D
        Set rng = ws.Range("D2:D1000")
        With rng.Validation
            .Delete
            .Add Type:=xlValidateList, Formula1:=statusValues
            .IgnoreBlank = True
            .InCellDropdown = True
        End With
        
        ' Add Priority dropdown in column E (if exists)
        Set rng = ws.Range("E2:E1000")
        With rng.Validation
            .Delete
            .Add Type:=xlValidateList, Formula1:=priorityValues
            .IgnoreBlank = True
            .InCellDropdown = True
        End With
        
        ' Add Mood dropdown in column F (if exists)
        Set rng = ws.Range("F2:F1000")
        With rng.Validation
            .Delete
            .Add Type:=xlValidateList, Formula1:=moodValues
            .IgnoreBlank = True
            .InCellDropdown = True
        End With
        
        On Error GoTo 0
    Next ws
    
    MsgBox "Dropdown shortcuts added!", vbInformation
End Sub
