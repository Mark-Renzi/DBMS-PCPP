import pandas as pd
import json
import os
import sys
import re
import numpy as np
import uuid

cpuBench = pd.read_csv('data/benchmarks/CPU_benchmark_v4.csv')
chipsets = pd.read_csv('data/processed-data/Chipset.csv')

splitname = cpuBench['cpuName'].str.split(' ', n=1, expand=True)
cpuBench['manufacturer'] = splitname[0]
cpuBench['model'] = splitname[1]

cpuBench = cpuBench.merge(chipsets[['Name', 'ChipsetID']], left_on='model', right_on='Name', how='inner')
cpuBench = cpuBench.drop(columns=['Name'])

cpuBench = cpuBench.rename(columns={'cpuMark': 'CPUMark', 'threadMark': 'ThreadMark', 'socket': 'Socket'})

# cpuBench[['ChipsetID', 'CPUMark', 'ThreadMark', 'Socket']].to_csv('data/processed-data/CPUBenchmarks.csv', index=False)

benchmarksCPU = pd.DataFrame(columns=['BenchmarkID', 'ChipsetID', 'Type', 'Score'])

# Iterate through cpuBench and create entries for CPUMark and ThreadMark
for index, row in cpuBench.iterrows():
    chipset_id = row['ChipsetID']
    
    # Entry for CPUMark
    cpumark_entry = {
        'BenchmarkID': str(uuid.uuid4()),
        'ChipsetID': chipset_id,
        'Type': 'CPUMark',
        'Score': row['CPUMark']
    }
    
    # Entry for ThreadMark
    threadmark_entry = {
        'BenchmarkID': str(uuid.uuid4()),
        'ChipsetID': chipset_id,
        'Type': 'ThreadMark',
        'Score': row['ThreadMark']
    }
    
    # Append both entries to the benchmarksCPU DataFrame
    benchmarksCPU = benchmarksCPU._append(cpumark_entry, ignore_index=True)
    benchmarksCPU = benchmarksCPU._append(threadmark_entry, ignore_index=True)

# benchmarksCPU[['BenchmarkID', 'ChipsetID', 'Type', 'Score']].to_csv('data/processed-data/CPUBenchmarks.csv', index=False)







cpuBenchR = pd.read_csv('data/benchmarks/CPU_r23_v2.csv')
chipsets = pd.read_csv('data/processed-data/Chipset.csv')

cpuBenchR['cpuName'] = cpuBenchR['cpuName'].str.replace(r'i([3|5|7|9])', r'i\1-', regex=True)
cpuBenchR['cpuName'] = cpuBenchR['cpuName'].str.replace('- ', '-', regex=True)
cpuBenchR = cpuBenchR.merge(chipsets[['Name', 'ChipsetID']], left_on='cpuName', right_on='Name', how='inner')
cpuBenchR = cpuBenchR.drop(columns=['Name'])

cpuBenchR = cpuBenchR.rename(columns={'singleScore': 'R23SingleScore', 'multiScore': 'R23MultiScore'})

# Iterate through cpuBenchR and create entries for singleScore and multiScore
for index, row in cpuBenchR.iterrows():
    chipset_id = row['ChipsetID']
    
    # Entry for singleScore
    single_score_entry = {
        'BenchmarkID': str(uuid.uuid4()),
        'ChipsetID': chipset_id,
        'Type': 'R23SingleScore',
        'Score': row['R23SingleScore']
    }
    
    # Append the singleScore entry to the benchmarksCPU DataFrame
    benchmarksCPU = benchmarksCPU._append(single_score_entry, ignore_index=True)
    
    # Entry for multiScore
    multi_score_entry = {
        'BenchmarkID': str(uuid.uuid4()),
        'ChipsetID': chipset_id,
        'Type': 'R23MultiScore',
        'Score': row['R23MultiScore']
    }
    
    # Append the multiScore entry to the benchmarksCPU DataFrame
    benchmarksCPU = benchmarksCPU._append(multi_score_entry, ignore_index=True)

# Print the resulting DataFrame
print(benchmarksCPU)

# Save the DataFrame to a CSV file
benchmarksCPU[['BenchmarkID', 'ChipsetID', 'Type', 'Score']].to_csv('data/benchmarks/CPUBenchmarks.csv', index=False)