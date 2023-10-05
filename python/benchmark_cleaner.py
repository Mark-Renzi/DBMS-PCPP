import pandas as pd
import json
import os
import sys
import re
import numpy as np
import uuid

# Read the CSV files into DataFrames
cpuBench = pd.read_csv('data/benchmarks/CPU_benchmark_v4.csv')
allParts = pd.read_csv('data/processed-data/ComputerPart.csv')

# Split the 'cpuName' column into 'manufacturer' and 'model'
splitname = cpuBench['cpuName'].str.split(' ', n=1, expand=True)
cpuBench['manufacturer'] = splitname[0]
cpuBench['model'] = splitname[1]

# Perform an inner join to retain only rows with matching 'model' and 'Model'
cpuBench = cpuBench.merge(allParts[['Model']], left_on='model', right_on='Model', how='inner')

# Drop the 'Model' column from the merged DataFrame
cpuBench = cpuBench.drop(columns=['Model'])

# Print the updated DataFrame
print(cpuBench)