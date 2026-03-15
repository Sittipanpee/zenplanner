' Sub: Auto-populate date in cell when sheet opens
Private Sub Workbook_Open()
    Dim ws As Worksheet
    For Each ws In ThisWorkbook.Worksheets
        ' Set today's date in cell A1 if it exists
        On Error Resume Next
        If ws.Range("A1").Value = "" Then
            ws.Range("A1").Value = Date
            ws.Range("A1").NumberFormat = "dd/mm/yyyy"
        End If
        On Error GoTo 0
    Next ws
End Sub
