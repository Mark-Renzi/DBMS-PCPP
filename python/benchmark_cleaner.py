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

benchmark_ids = [str(uuid.uuid4()) for _ in range(len(cpuBench.index) * 2)]

# Iterate through cpuBench and create entries for CPUMark and ThreadMark
for index, row in cpuBench.iterrows():
    chipset_id = row['ChipsetID']
    
    # Entry for CPUMark
    cpumark_entry = {
        'BenchmarkID': benchmark_ids.pop(0),
        'ChipsetID': chipset_id,
        'Type': 'CPUMark',
        'Score': row['CPUMark']
    }
    
    # Entry for ThreadMark
    threadmark_entry = {
        'BenchmarkID': benchmark_ids.pop(0),
        'ChipsetID': chipset_id,
        'Type': 'ThreadMark',
        'Score': row['ThreadMark']
    }
    
    # Append both entries to the benchmarksCPU DataFrame
    benchmarksCPU = benchmarksCPU._append(cpumark_entry, ignore_index=True)
    benchmarksCPU = benchmarksCPU._append(threadmark_entry, ignore_index=True)

benchmarksCPU[['BenchmarkID', 'ChipsetID', 'Type', 'Score']].to_csv('data/processed-data/CPUBenchmarks.csv', index=False)

print(benchmarksCPU)