//
//  GatewayWifiSettingsViewController.m
//  ParkSmartTool
//
//  Created by Cef Ramirez on 11/20/15.
//  Copyright © 2015 CMU. All rights reserved.
//

#import "GatewayWifiSettingsViewController.h"

#import "WifiTableViewCell.h"

@interface GatewayWifiSettingsViewController () <UITableViewDelegate, UITableViewDataSource>

@property (nonatomic, weak) IBOutlet UITextField *ssidField;
@property (nonatomic, weak) IBOutlet UITextField *passField;
@property (nonatomic, weak) IBOutlet UITableView *tableView;

@property (nonatomic, strong) UITableViewController *tableViewController;
@property (nonatomic, strong) UIRefreshControl *refreshControl;

@property (nonatomic, strong) NSArray *ssids;

- (IBAction)saveSettings:(id)sender;

@end

@implementation GatewayWifiSettingsViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.tableViewController = [UITableViewController new];
    self.tableViewController.tableView = self.tableView;
    
    UIRefreshControl *refresh = [UIRefreshControl new];
    [refresh addTarget:self action:@selector(refreshData:) forControlEvents:UIControlEventValueChanged];
    self.tableViewController.refreshControl = refresh;
    self.refreshControl = refresh;
    [self refreshData:nil];
}

- (void)refreshData:(id)sender
{
    [self.refreshControl beginRefreshing];
    NSString *urlString = [NSString stringWithFormat:@"http://%@:%ld/api/v1/wifi/list", self.server, self.port];
    [[[NSURLSession sharedSession] dataTaskWithURL:[NSURL URLWithString:urlString]
                                 completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
                                     NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
                                     dispatch_async(dispatch_get_main_queue(), ^{
                                         if(httpResponse.statusCode == 200){
                                             NSArray *wifi = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
                                             self.ssids = wifi;
                                             [self.tableView reloadData];
                                         }
                                         [self.refreshControl endRefreshing];
                                     });
                                 }] resume];
}


- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return self.ssids.count;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    WifiTableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"wifi" forIndexPath:indexPath];
    
    NSDictionary *ssid = self.ssids[indexPath.row];

    cell.ssid.text = ssid[@"ssid"];
    cell.frequency.text = ssid[@"frequency"];
    cell.channel.text = ssid[@"channel"];
    cell.signalStrength.text = ssid[@"signal_strength"];
    
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    NSDictionary *ssid = self.ssids[indexPath.row];
    self.ssidField.text = ssid[@"ssid"];
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
}

- (IBAction)saveSettings:(id)sender
{
    // validate
    if(self.ssidField.text.length == 0){
        [self displayError:@"SSID cannot be empty"];
        return;
    }
    
    NSMutableDictionary *settings = [NSMutableDictionary new];
    settings[@"ssid"] = self.ssidField.text;
    if(self.passField.text.length > 0){
        settings[@"password"] = self.passField.text;
    }
    
    NSString *urlString = [NSString stringWithFormat:@"http://%@:%ld/api/v1/wifi/configure", self.server, self.port];
    
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:urlString]];
    request.HTTPMethod = @"POST";
    [request addValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    request.HTTPBody = [NSJSONSerialization dataWithJSONObject:settings options:0 error:nil];
    
    [[[NSURLSession sharedSession] dataTaskWithRequest:request
                                     completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
                                         NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
                                         dispatch_async(dispatch_get_main_queue(), ^{
                                             if(httpResponse.statusCode == 200){
                                                 [self onWifiSet];
                                             } else {
                                                 [self displayError:@"Failed to save settings"];
                                             }
                                         });
                                     }] resume];
}

- (void)onWifiSet
{
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"WiFi Set"
                                                                   message:@"Gateway network will now restart."
                                                            preferredStyle:UIAlertControllerStyleAlert];
    [alert addAction:[UIAlertAction actionWithTitle:@"Disconnect"
                                              style:UIAlertActionStyleCancel
                                            handler:^(UIAlertAction * _Nonnull action) {
                                                [self.navigationController popToRootViewControllerAnimated:YES];
                                            }]];
    [self presentViewController:alert animated:YES completion:nil];
}

- (void)displayError:(NSString *)error
{
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"Error"
                                                                   message:error
                                                            preferredStyle:UIAlertControllerStyleAlert];
    [alert addAction:[UIAlertAction actionWithTitle:@"OK"
                                              style:UIAlertActionStyleCancel
                                            handler:nil]];
    [self presentViewController:alert animated:YES completion:nil];
}

@end
