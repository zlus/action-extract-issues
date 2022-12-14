# Action Extract Issues

This is a GitHub Action to Extract issues from push commit messages and can have basic operations like: add labels, remove labels, and add comment

It would be more useful to use this with other GitHub Actions' outputs.


## Usage

### Extract Issues And Operate it

```yaml
name: Set Issues

on:
  push:
    branches:
      - main

jobs:
  SetIssues:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Set Issues
        uses: zlus/action-extract-issues@1.0.0
        id: set_issues
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          match-reg: 'test +#(\d+)' # optional
          add-labels: enhancement   # optional
          remove-labels: bug        # optional
          add-comment: |            # optional
            already fixed. 

      - name: Log
        run: echo ${{ steps.set_issues.outputs.issues }}
```
 

## env

    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
## Inputs

    match-reg:
      description: Regular extraction
      default: 'fix:? ?#(\d+)'

    add-labels:
      description: Add labels on issue

    remove-labels:
      description: Remove labels on issue

    add-comment:
      description: Add comment on issue

    fail-on-error:
      description: Whether the action fails when an error occurs in the operations.
      default: 'false'

## Outputs

    issues:
      description: "The extracted issues numbers"
