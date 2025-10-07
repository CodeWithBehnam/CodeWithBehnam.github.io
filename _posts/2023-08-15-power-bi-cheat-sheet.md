---
layout: post
title: "Power BI Cheat Sheet: Quick Reference Guide"
date: 2023-08-15
categories: [Power BI, Analytics]
tags: [powerbi, dax, data-visualization, business-intelligence, cheat-sheet]
---

Power BI is Microsoft's powerful business intelligence tool for data visualization and analytics. This comprehensive cheat sheet provides quick references for DAX formulas, keyboard shortcuts, best practices, and common tasks.

## Table of Contents

- [DAX Functions](#dax-functions)
- [Power Query M Functions](#power-query-m-functions)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Data Modeling Best Practices](#data-modeling-best-practices)
- [Visualization Tips](#visualization-tips)
- [Performance Optimization](#performance-optimization)

## DAX Functions

### Aggregation Functions

```dax
// Basic aggregations
SUM([Column])
AVERAGE([Column])
MIN([Column])
MAX([Column])
COUNT([Column])
COUNTROWS(Table)
DISTINCTCOUNT([Column])

// Count non-blank values
COUNTA([Column])

// Count blank values
COUNTBLANK([Column])
```

### Calculate Function

```dax
// Basic CALCULATE syntax
Total Sales = CALCULATE(
    SUM(Sales[Amount]),
    Sales[Year] = 2023
)

// Multiple filters
Filtered Sales = CALCULATE(
    SUM(Sales[Amount]),
    Sales[Year] = 2023,
    Sales[Region] = "West"
)

// ALL - Remove filters
Total All Sales = CALCULATE(
    SUM(Sales[Amount]),
    ALL(Sales)
)

// ALLEXCEPT - Remove all filters except specified
Sales By Category = CALCULATE(
    SUM(Sales[Amount]),
    ALLEXCEPT(Sales, Sales[Category])
)
```

### Time Intelligence Functions

```dax
// Year to Date
YTD Sales = TOTALYTD(
    SUM(Sales[Amount]),
    'Date'[Date]
)

// Previous Year
PY Sales = CALCULATE(
    SUM(Sales[Amount]),
    SAMEPERIODLASTYEAR('Date'[Date])
)

// Month to Date
MTD Sales = TOTALMTD(
    SUM(Sales[Amount]),
    'Date'[Date]
)

// Year over Year Growth
YoY Growth = 
DIVIDE(
    [Total Sales] - [PY Sales],
    [PY Sales]
)

// Date Add (shift dates)
Last Year Sales = CALCULATE(
    SUM(Sales[Amount]),
    DATEADD('Date'[Date], -1, YEAR)
)
```

### Filter Functions

```dax
// FILTER - Returns a table with filtered rows
High Value Sales = CALCULATE(
    [Total Sales],
    FILTER(Sales, Sales[Amount] > 1000)
)

// KEEPFILTERS - Preserve existing filters
Adjusted Sales = CALCULATE(
    SUM(Sales[Amount]),
    KEEPFILTERS(Sales[Category] = "Electronics")
)

// REMOVEFILTERS - Remove specific filters
All Time Sales = CALCULATE(
    SUM(Sales[Amount]),
    REMOVEFILTERS('Date')
)
```

### Logical Functions

```dax
// IF statement
Status = IF(
    [Total Sales] > 10000,
    "High",
    "Low"
)

// Multiple conditions with AND/OR
Category = 
IF(
    AND([Total Sales] > 10000, [Units Sold] > 100),
    "Premium",
    IF(
        OR([Total Sales] > 5000, [Units Sold] > 50),
        "Standard",
        "Basic"
    )
)

// SWITCH (cleaner than nested IFs)
Rating = 
SWITCH(
    TRUE(),
    [Score] >= 90, "Excellent",
    [Score] >= 75, "Good",
    [Score] >= 60, "Average",
    "Poor"
)
```

### Text Functions

```dax
// Concatenate
Full Name = [First Name] & " " & [Last Name]

// Format
Formatted Date = FORMAT('Date'[Date], "MMM DD, YYYY")
Formatted Number = FORMAT([Amount], "$#,##0.00")

// Upper/Lower case
UPPER([Column])
LOWER([Column])

// Substring
LEFT([Column], 5)
RIGHT([Column], 3)
MID([Column], 2, 4)

// Replace
SUBSTITUTE([Column], "Old", "New")

// Trim spaces
TRIM([Column])
```

### Relationship Functions

```dax
// RELATED - Get value from related table (many-to-one)
Product Category = RELATED(Products[Category])

// RELATEDTABLE - Get table from related table (one-to-many)
Total Order Items = COUNTROWS(RELATEDTABLE(OrderDetails))

// USERELATIONSHIP - Activate inactive relationship
Sales Shipped Date = CALCULATE(
    SUM(Sales[Amount]),
    USERELATIONSHIP(Sales[ShipDate], 'Date'[Date])
)
```

### Table Functions

```dax
// SUMMARIZE - Create summary table
Summary = 
SUMMARIZE(
    Sales,
    Sales[Category],
    Sales[Region],
    "Total", SUM(Sales[Amount])
)

// ADDCOLUMNS - Add calculated columns to table
Extended = 
ADDCOLUMNS(
    Products,
    "Margin", Products[Price] - Products[Cost]
)

// VALUES - Get unique values
Unique Categories = VALUES(Sales[Category])

// DISTINCT - Get distinct values (includes blank)
Distinct Customers = DISTINCT(Sales[CustomerID])
```

### Statistical Functions

```dax
// Standard Deviation
STDEV.P([Column])  // Population
STDEV.S([Column])  // Sample

// Variance
VAR.P([Column])    // Population
VAR.S([Column])    // Sample

// Median
MEDIAN([Column])

// Percentile
PERCENTILEX.INC(Table, [Column], 0.95)
```

### Ranking Functions

```dax
// RANKX - Rank values
Product Rank = 
RANKX(
    ALL(Products[ProductName]),
    [Total Sales],
    ,
    DESC,
    DENSE
)

// TOPN - Get top N rows
Top 10 Products = 
TOPN(
    10,
    ALL(Products),
    [Total Sales],
    DESC
)
```

## Power Query M Functions

### Common Transformations

{% raw %}
```m
// Remove columns
Table.RemoveColumns(Source, {"Column1", "Column2"})

// Rename columns
Table.RenameColumns(Source, {{"OldName", "NewName"}})

// Change data type
Table.TransformColumnTypes(Source, {{"Column", Int64.Type}})

// Filter rows
Table.SelectRows(Source, each [Amount] > 100)

// Add custom column
Table.AddColumn(Source, "NewColumn", each [Column1] * [Column2])

// Replace values
Table.ReplaceValue(Source, "Old", "New", Replacer.ReplaceText, {"Column"})

// Merge queries (Join)
Table.NestedJoin(Source1, "Key", Source2, "Key", "NewColumn", JoinKind.Inner)

// Append queries (Union)
Table.Combine({Source1, Source2})

// Group by
Table.Group(Source, {"Category"}, {{"Total", each List.Sum([Amount]), type number}})
```
{% endraw %}

// Pivot column
Table.Pivot(Source, List.Distinct(Source[Category]), "Category", "Value")

// Unpivot columns
Table.UnpivotOtherColumns(Source, {"ID"}, "Attribute", "Value")
```

### Date Functions

```m
// Get current date/time
DateTime.LocalNow()
Date.From(DateTime.LocalNow())

// Date parts
Date.Year([Date])
Date.Month([Date])
Date.Day([Date])
Date.DayOfWeek([Date])

// Date calculations
Date.AddDays([Date], 7)
Date.AddMonths([Date], 1)
Date.AddYears([Date], 1)

// Date difference
Duration.Days([EndDate] - [StartDate])
```

## Keyboard Shortcuts

### General Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + S` | Save report |
| `Ctrl + O` | Open file |
| `Ctrl + N` | New report |
| `Ctrl + C` | Copy visual |
| `Ctrl + V` | Paste visual |
| `Ctrl + X` | Cut visual |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `F5` | Start slideshow |
| `Esc` | Exit slideshow |
| `Ctrl + F` | Search |

### Visual Manipulation

| Shortcut | Action |
|----------|--------|
| `Ctrl + A` | Select all visuals |
| `Ctrl + G` | Group visuals |
| `Ctrl + Shift + G` | Ungroup visuals |
| `Ctrl + D` | Duplicate visual |
| `Alt + F4` | Close Power BI |
| `Ctrl + [` | Send backward |
| `Ctrl + ]` | Bring forward |
| `Ctrl + Shift + [` | Send to back |
| `Ctrl + Shift + ]` | Bring to front |

### Data View

| Shortcut | Action |
|----------|--------|
| `Ctrl + 1` | Report view |
| `Ctrl + 2` | Data view |
| `Ctrl + 3` | Model view |

### Formatting

| Shortcut | Action |
|----------|--------|
| `Ctrl + B` | Bold |
| `Ctrl + I` | Italic |
| `Ctrl + U` | Underline |
| `Ctrl + Shift + >` | Increase font size |
| `Ctrl + Shift + <` | Decrease font size |

## Data Modeling Best Practices

### Star Schema Design

```
Fact Table (Sales)
├── Date Key → Dim Date
├── Product Key → Dim Product
├── Customer Key → Dim Customer
└── Store Key → Dim Store
```

**Best Practices:**
- Keep fact tables narrow (only keys and measures)
- Create dimension tables for descriptive attributes
- Use surrogate keys (integers) for relationships
- Avoid many-to-many relationships when possible
- Create a dedicated Date dimension table

### Relationship Types

- **One-to-Many (1:*)**: Most common, from dimension to fact table
- **Many-to-One (*:1)**: Opposite direction of one-to-many
- **One-to-One (1:1)**: Rare, usually indicates poor design
- **Many-to-Many (*:*)**: Use bridge tables or DAX instead

### Cardinality Best Practices

```
✓ Good: Dimension (1) → Fact (*)
✗ Avoid: Fact (*) ← (*) Fact
✓ Use: Bridge tables for many-to-many
✓ Mark: Date tables as date table
```

## Visualization Tips

### Chart Selection Guide

| Data Type | Best Visual |
|-----------|-------------|
| Comparison | Bar/Column Chart |
| Trend over time | Line Chart |
| Part-to-whole | Pie/Donut Chart |
| Relationship | Scatter Plot |
| Distribution | Histogram |
| Geographic | Map |
| Hierarchy | Treemap |
| KPIs | Card/Gauge |
| Tables | Matrix/Table |

### Color Best Practices

- **Limit colors**: Use 5-7 colors maximum
- **Consistency**: Use same colors for same categories across visuals
- **Accessibility**: Ensure sufficient contrast (WCAG 2.0 AA)
- **Meaning**: Use red for negative, green for positive
- **Branding**: Incorporate company colors

### Design Principles

1. **Less is More**: Remove unnecessary elements
2. **Alignment**: Align visuals in a grid
3. **White Space**: Don't overcrowd the canvas
4. **Hierarchy**: Most important metrics at top-left
5. **Consistency**: Use same fonts, colors, sizes

## Performance Optimization

### DAX Optimization

```dax
// ✗ Slow - Calculated column
TotalCost = Sales[Quantity] * Sales[UnitPrice]

// ✓ Fast - Measure
Total Cost = SUMX(Sales, Sales[Quantity] * Sales[UnitPrice])

// ✗ Slow - Row context iteration
BadMeasure = SUMX(Sales, CALCULATE(SUM(Costs[Amount])))

// ✓ Fast - Filter context
GoodMeasure = SUM(Costs[Amount])
```

### Query Optimization

**Best Practices:**
- Remove unnecessary columns in Power Query
- Filter data early in the transformation
- Use query folding when possible
- Disable auto date/time hierarchy
- Use aggregated tables for large datasets
- Implement incremental refresh

### Data Model Optimization

```
✓ Use integer keys instead of text
✓ Remove unused columns and tables
✓ Use calculated columns sparingly
✓ Prefer measures over calculated columns
✓ Sort columns by numeric keys
✓ Reduce cardinality where possible
✓ Use VertiPaq compression
```

### Report Optimization

- Limit visuals per page (8-10 maximum)
- Use bookmarks instead of multiple pages
- Avoid high-cardinality visuals
- Use Performance Analyzer to identify slow visuals
- Optimize custom visuals or replace with native ones
- Reduce filter interactions

## Common DAX Patterns

### Percentage of Total

```dax
% of Total = 
DIVIDE(
    SUM(Sales[Amount]),
    CALCULATE(
        SUM(Sales[Amount]),
        ALL(Sales)
    )
)
```

### Running Total

```dax
Running Total = 
CALCULATE(
    SUM(Sales[Amount]),
    FILTER(
        ALL('Date'[Date]),
        'Date'[Date] <= MAX('Date'[Date])
    )
)
```

### Same Period Last Year

```dax
SPLY = 
CALCULATE(
    [Total Sales],
    DATEADD('Date'[Date], -1, YEAR)
)
```

### Moving Average

```dax
3M Moving Avg = 
AVERAGEX(
    DATESINPERIOD(
        'Date'[Date],
        LASTDATE('Date'[Date]),
        -3,
        MONTH
    ),
    [Total Sales]
)
```

### ABC Classification

```dax
ABC Class = 
VAR CurrentRank = [Product Rank]
VAR TotalProducts = COUNTROWS(ALL(Products))
RETURN
    SWITCH(
        TRUE(),
        CurrentRank <= TotalProducts * 0.2, "A",
        CurrentRank <= TotalProducts * 0.5, "B",
        "C"
    )
```

## Publishing and Sharing

### Workspace Roles

| Role | Permissions |
|------|-------------|
| Admin | Full control, manage workspace |
| Member | Publish, create, edit content |
| Contributor | Create, edit own content |
| Viewer | View content only |

### Deployment Process

1. **Development**: Create in Power BI Desktop
2. **Testing**: Publish to dev workspace
3. **UAT**: Move to test workspace
4. **Production**: Deploy to production workspace
5. **Schedule**: Set up refresh schedules

### Gateway Types

- **Personal**: For individual use
- **Enterprise**: For organizational data sources
- **VNet**: For Azure services

## Quick Tips

💡 **Pro Tips:**
- Press `Ctrl + Alt + V` to see DAX query behind visual
- Use `ALT` key to see visual interaction effects
- Create reusable measures in separate table
- Document complex DAX with comments (`//`)
- Use measure groups for organization
- Enable "Show items with no data" for complete analysis
- Use BLANK() instead of 0 for cleaner visuals
- Create calculation groups for time intelligence
- Use field parameters for dynamic visuals

## Common Errors and Solutions

| Error | Solution |
|-------|----------|
| Circular dependency | Check calculated columns referencing each other |
| Cannot find table | Verify table name spelling |
| CALCULATE used incorrectly | Ensure filter arguments are table expressions |
| Ambiguous column reference | Qualify with table name: `Table[Column]` |
| Data type mismatch | Convert types in Power Query or DAX |
| Relationship issues | Check cardinality and cross-filter direction |

## Resources

- **Official Documentation**: [docs.microsoft.com/power-bi](https://docs.microsoft.com/power-bi)
- **DAX Guide**: [dax.guide](https://dax.guide)
- **Community**: [community.powerbi.com](https://community.powerbi.com)
- **Training**: [Microsoft Learn Power BI](https://learn.microsoft.com/training/powerplatform/power-bi)

## Conclusion

This cheat sheet covers the essential Power BI concepts, DAX formulas, and best practices. Bookmark this page for quick reference when working on your Power BI projects. Remember that mastery comes with practice—experiment with different formulas and techniques to find what works best for your specific use cases.

Happy analyzing! 📊
